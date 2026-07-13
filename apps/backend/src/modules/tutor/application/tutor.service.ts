import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { PolicyService } from '../../../shared/authz/policy.service';
import { DomainError } from '../../../platform/errors/domain-error';
import type { AuthenticatedPrincipal } from '../../../shared/identity/request-context';
import type {
  CreateTutorProfileDto,
  UpdateTutorProfileDto,
  CreateOfferingDto,
  OfferingStatusDto,
} from '../contracts/tutor.dto';

/**
 * Tutor domain service (Business Domain Model §5). Owns the tutor profile and
 * offerings. A tutor may only OFFER/deliver when verified (BR-002) — activating
 * an offering is gated on verification status here. Pricing rules stay PBD.
 *
 * Object-level authorization (P0-1): a tutor profile/offering may only be
 * created/changed by the owning account (or staff) — never on behalf of an
 * arbitrary account just because the caller holds the manage permission.
 */
@Injectable()
export class TutorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly policy: PolicyService,
  ) {}

  // ---- Profile ----
  async createProfile(dto: CreateTutorProfileDto, principal: AuthenticatedPrincipal, correlationId?: string) {
    const actorAccountId = principal.accountId;
    const accountId = dto.accountId ?? actorAccountId;
    // A tutor may only claim their own account; staff may onboard on behalf of another.
    this.policy.assertIsSelfOrOperational(principal, accountId);
    const account = await this.prisma.userAccount.findFirst({
      where: { id: accountId, isDeleted: false },
    });
    if (!account) throw DomainError.notFound('Account not found.');

    // findFirst + isDeleted filter (P0-2): a soft-deleted profile must not
    // permanently block creating a new one for the same account.
    const existing = await this.prisma.tutorProfile.findFirst({ where: { accountId, isDeleted: false } });
    if (existing) throw DomainError.conflict('Tutor profile already exists for this account.');

    const profile = await this.prisma.tutorProfile.create({
      data: {
        accountId,
        headline: dto.headline ?? null,
        bio: dto.bio ?? null,
        jurisdictionId: dto.jurisdictionId ?? null,
        // Starts UNVERIFIED; cannot be discovered/booked until VERIFIED (BR-002).
        createdBy: actorAccountId,
      },
    });
    await this.audit.record({
      actorAccountId,
      action: 'tutor.profile.created',
      entityType: 'TutorProfile',
      entityReference: profile.id,
      classification: 'personal',
      correlationId,
    });
    return this.toProfileResponse(profile);
  }

  async getProfileById(id: string) {
    const profile = await this.prisma.tutorProfile.findFirst({ where: { id, isDeleted: false } });
    if (!profile) throw DomainError.notFound('Tutor profile not found.');
    return this.toProfileResponse(profile);
  }

  async getByAccount(accountId: string) {
    const profile = await this.prisma.tutorProfile.findFirst({ where: { accountId, isDeleted: false } });
    if (!profile) throw DomainError.notFound('Tutor profile not found.');
    return this.toProfileResponse(profile);
  }

  async updateProfile(
    id: string,
    dto: UpdateTutorProfileDto,
    principal: AuthenticatedPrincipal,
    correlationId?: string,
  ) {
    const actorAccountId = principal.accountId;
    const existing = await this.getProfileById(id);
    this.policy.assertIsSelfOrOperational(principal, existing.accountId);
    const profile = await this.prisma.tutorProfile.update({
      where: { id },
      data: {
        ...(dto.headline !== undefined ? { headline: dto.headline } : {}),
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
        ...(dto.jurisdictionId !== undefined ? { jurisdictionId: dto.jurisdictionId } : {}),
        updatedBy: actorAccountId,
        recordVersion: { increment: 1 },
      },
    });
    await this.audit.record({
      actorAccountId,
      action: 'tutor.profile.updated',
      entityType: 'TutorProfile',
      entityReference: id,
      classification: 'personal',
      correlationId,
    });
    return this.toProfileResponse(profile);
  }

  // ---- Offerings ----
  async createOffering(
    tutorId: string,
    dto: CreateOfferingDto,
    principal: AuthenticatedPrincipal,
    correlationId?: string,
  ) {
    const actorAccountId = principal.accountId;
    const existing = await this.getProfileById(tutorId);
    this.policy.assertIsSelfOrOperational(principal, existing.accountId);
    if (dto.basePrice !== undefined && !dto.currencyId) {
      // Money must be currency-explicit (DB Arch §12).
      throw DomainError.validation('basePrice requires a currencyId.');
    }
    const offering = await this.prisma.tutorOffering.create({
      data: {
        tutorId,
        subject: dto.subject.toLowerCase().trim(),
        title: dto.title,
        description: dto.description ?? null,
        basePrice: dto.basePrice ?? null,
        currencyId: dto.currencyId ?? null,
        createdBy: actorAccountId,
      },
    });
    await this.audit.record({
      actorAccountId,
      action: 'tutor.offering.created',
      entityType: 'TutorOffering',
      entityReference: offering.id,
      correlationId,
    });
    return { id: offering.id, status: offering.status };
  }

  async setOfferingStatus(
    offeringId: string,
    status: OfferingStatusDto,
    principal: AuthenticatedPrincipal,
    correlationId?: string,
  ) {
    const actorAccountId = principal.accountId;
    const offering = await this.prisma.tutorOffering.findFirst({
      where: { id: offeringId, isDeleted: false },
    });
    if (!offering) throw DomainError.notFound('Offering not found.');
    const tutor = await this.prisma.tutorProfile.findUnique({ where: { id: offering.tutorId } });
    if (!tutor) throw DomainError.notFound('Tutor profile not found.');
    this.policy.assertIsSelfOrOperational(principal, tutor.accountId);

    // Eligibility gate (BR-002): an offering can only go ACTIVE if the tutor is
    // VERIFIED. Absent verification it cannot be made discoverable/bookable.
    if (status === 'ACTIVE' && tutor.verificationStatus !== 'VERIFIED') {
      throw DomainError.forbidden('Offering cannot be activated until the tutor is verified.');
    }

    const updated = await this.prisma.tutorOffering.update({
      where: { id: offeringId },
      data: { status, updatedBy: actorAccountId, recordVersion: { increment: 1 } },
    });
    await this.audit.record({
      actorAccountId,
      action: 'tutor.offering.status_changed',
      entityType: 'TutorOffering',
      entityReference: offeringId,
      authorityContext: { status },
      correlationId,
    });
    return { id: updated.id, status: updated.status };
  }

  private toProfileResponse(p: {
    id: string;
    accountId: string;
    headline: string | null;
    bio: string | null;
    verificationStatus: string;
    jurisdictionId: string | null;
    ratingAverage: unknown;
    ratingCount: number;
  }) {
    return {
      id: p.id,
      accountId: p.accountId,
      headline: p.headline,
      bio: p.bio,
      verificationStatus: p.verificationStatus,
      jurisdictionId: p.jurisdictionId,
      ratingAverage: p.ratingAverage ? Number(p.ratingAverage) : null,
      ratingCount: p.ratingCount,
    };
  }
}