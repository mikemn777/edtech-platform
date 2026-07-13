import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { PolicyService } from '../../../shared/authz/policy.service';
import { DomainError } from '../../../platform/errors/domain-error';
import type { AuthenticatedPrincipal } from '../../../shared/identity/request-context';
import type { CreateParentProfileDto, UpdateParentProfileDto } from '../contracts/parent.dto';

/**
 * Parent domain service (Business Domain Model §4). Owns the parent profile.
 * The scope/rules of parental oversight over a linked student are Pending
 * Business/Legal Decisions (BR-102); this service manages structure only.
 *
 * Object-level authorization (P0-1): a parent profile may only be
 * created/read/changed by the owning account (or staff).
 */
@Injectable()
export class ParentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly policy: PolicyService,
  ) {}

  async create(
    dto: CreateParentProfileDto,
    principal: AuthenticatedPrincipal,
    correlationId?: string,
  ) {
    const actorAccountId = principal.accountId;
    const accountId = dto.accountId ?? actorAccountId;
    this.policy.assertIsSelfOrOperational(principal, accountId);
    await this.ensureAccountExists(accountId);

    // findFirst + isDeleted filter (P0-2): a soft-deleted profile must not
    // permanently block creating a new one for the same account.
    const existing = await this.prisma.parentProfile.findFirst({ where: { accountId, isDeleted: false } });
    if (existing) throw DomainError.conflict('Parent profile already exists for this account.');

    const profile = await this.prisma.parentProfile.create({
      data: {
        accountId,
        oversightContext: (dto.oversightContext as Prisma.InputJsonValue) ?? undefined,
        createdBy: actorAccountId,
      },
    });
    await this.audit.record({
      actorAccountId,
      action: 'parent.profile.created',
      entityType: 'ParentProfile',
      entityReference: profile.id,
      classification: 'personal',
      correlationId,
    });
    return { id: profile.id, accountId: profile.accountId };
  }

  async getById(id: string, principal: AuthenticatedPrincipal) {
    const profile = await this.prisma.parentProfile.findFirst({ where: { id, isDeleted: false } });
    if (!profile) throw DomainError.notFound('Parent profile not found.');
    this.policy.assertIsSelfOrOperational(principal, profile.accountId);
    return { id: profile.id, accountId: profile.accountId };
  }

  async update(
    id: string,
    dto: UpdateParentProfileDto,
    principal: AuthenticatedPrincipal,
    correlationId?: string,
  ) {
    const actorAccountId = principal.accountId;
    await this.getById(id, principal);
    const profile = await this.prisma.parentProfile.update({
      where: { id },
      data: {
        ...(dto.oversightContext !== undefined ? { oversightContext: dto.oversightContext as Prisma.InputJsonValue } : {}),
        updatedBy: actorAccountId,
        recordVersion: { increment: 1 },
      },
    });
    await this.audit.record({
      actorAccountId,
      action: 'parent.profile.updated',
      entityType: 'ParentProfile',
      entityReference: id,
      classification: 'personal',
      correlationId,
    });
    return { id: profile.id, accountId: profile.accountId };
  }

  private async ensureAccountExists(accountId: string): Promise<void> {
    const account = await this.prisma.userAccount.findFirst({
      where: { id: accountId, isDeleted: false },
    });
    if (!account) throw DomainError.notFound('Account not found.');
  }
}
