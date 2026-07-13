import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { PolicyService } from '../../../shared/authz/policy.service';
import { DomainError } from '../../../platform/errors/domain-error';
import type { AuthenticatedPrincipal } from '../../../shared/identity/request-context';
import type { CreateStudentProfileDto, UpdateStudentProfileDto } from '../contracts/student.dto';

/**
 * Student domain service (Business Domain Model §3). Owns the student profile.
 * Minor determination: if a date of birth is provided we still default to the
 * most protective outcome unless an authoritative age rule exists — which is a
 * Pending Business/Legal Decision (Art. VI; BR-003). So `isMinor` defaults true
 * and is only relaxed when such a rule is logged (not in this phase).
 *
 * Object-level authorization (P0-1): a student profile may only be
 * created/read/changed by the owning account, an active guardian, or staff.
 */
@Injectable()
export class StudentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly policy: PolicyService,
  ) {}

  async create(
    dto: CreateStudentProfileDto,
    principal: AuthenticatedPrincipal,
    correlationId?: string,
  ) {
    const actorAccountId = principal.accountId;
    const accountId = dto.accountId ?? actorAccountId;
    // A student may only claim their own account; staff may onboard on behalf of another.
    this.policy.assertIsSelfOrOperational(principal, accountId);
    await this.ensureAccountExists(accountId);

    // findFirst + isDeleted filter (P0-2): a soft-deleted profile must not
    // permanently block creating a new one for the same account.
    const existing = await this.prisma.studentProfile.findFirst({ where: { accountId, isDeleted: false } });
    if (existing) throw DomainError.conflict('Student profile already exists for this account.');

    const profile = await this.prisma.studentProfile.create({
      data: {
        accountId,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        // Most-protective default (BR-003). No age rule is authoritatively set.
        isMinor: true,
        jurisdictionId: dto.jurisdictionId ?? null,
        learningContext: (dto.learningContext as Prisma.InputJsonValue) ?? undefined,
        createdBy: actorAccountId,
      },
    });

    await this.audit.record({
      actorAccountId,
      action: 'student.profile.created',
      entityType: 'StudentProfile',
      entityReference: profile.id,
      classification: 'minor_related',
      correlationId,
    });
    return this.toResponse(profile);
  }

  async getByAccount(accountId: string) {
    const profile = await this.prisma.studentProfile.findFirst({
      where: { accountId, isDeleted: false },
    });
    if (!profile) throw DomainError.notFound('Student profile not found.');
    return this.toResponse(profile);
  }

  async getById(id: string, principal: AuthenticatedPrincipal) {
    const profile = await this.prisma.studentProfile.findFirst({ where: { id, isDeleted: false } });
    if (!profile) throw DomainError.notFound('Student profile not found.');
    if (!(await this.policy.canActOnStudentAccount(principal, profile.accountId))) {
      throw DomainError.forbidden();
    }
    return this.toResponse(profile);
  }

  async update(
    id: string,
    dto: UpdateStudentProfileDto,
    principal: AuthenticatedPrincipal,
    correlationId?: string,
  ) {
    const actorAccountId = principal.accountId;
    await this.getById(id, principal);
    const profile = await this.prisma.studentProfile.update({
      where: { id },
      data: {
        ...(dto.dateOfBirth !== undefined ? { dateOfBirth: new Date(dto.dateOfBirth) } : {}),
        ...(dto.jurisdictionId !== undefined ? { jurisdictionId: dto.jurisdictionId } : {}),
        ...(dto.learningContext !== undefined ? { learningContext: dto.learningContext as Prisma.InputJsonValue } : {}),
        updatedBy: actorAccountId,
        recordVersion: { increment: 1 },
      },
    });
    await this.audit.record({
      actorAccountId,
      action: 'student.profile.updated',
      entityType: 'StudentProfile',
      entityReference: id,
      classification: 'minor_related',
      correlationId,
    });
    return this.toResponse(profile);
  }

  private async ensureAccountExists(accountId: string): Promise<void> {
    const account = await this.prisma.userAccount.findFirst({
      where: { id: accountId, isDeleted: false },
    });
    if (!account) throw DomainError.notFound('Account not found.');
  }

  private toResponse(p: {
    id: string;
    accountId: string;
    isMinor: boolean;
    jurisdictionId: string | null;
  }) {
    return { id: p.id, accountId: p.accountId, isMinor: p.isMinor, jurisdictionId: p.jurisdictionId };
  }
}
