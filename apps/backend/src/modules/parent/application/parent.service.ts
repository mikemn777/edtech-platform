import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { DomainError } from '../../../platform/errors/domain-error';
import type { CreateParentProfileDto, UpdateParentProfileDto } from '../contracts/parent.dto';

/**
 * Parent domain service (Business Domain Model §4). Owns the parent profile.
 * The scope/rules of parental oversight over a linked student are Pending
 * Business/Legal Decisions (BR-102); this service manages structure only.
 */
@Injectable()
export class ParentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(
    dto: CreateParentProfileDto,
    actorAccountId: string,
    correlationId?: string,
  ) {
    const accountId = dto.accountId ?? actorAccountId;
    await this.ensureAccountExists(accountId);

    const existing = await this.prisma.parentProfile.findUnique({ where: { accountId } });
    if (existing) throw DomainError.conflict('Parent profile already exists for this account.');

    const profile = await this.prisma.parentProfile.create({
      data: {
        accountId,
        oversightContext: dto.oversightContext ?? undefined,
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

  async getById(id: string) {
    const profile = await this.prisma.parentProfile.findFirst({ where: { id, isDeleted: false } });
    if (!profile) throw DomainError.notFound('Parent profile not found.');
    return { id: profile.id, accountId: profile.accountId };
  }

  async update(
    id: string,
    dto: UpdateParentProfileDto,
    actorAccountId: string,
    correlationId?: string,
  ) {
    await this.getById(id);
    const profile = await this.prisma.parentProfile.update({
      where: { id },
      data: {
        ...(dto.oversightContext !== undefined ? { oversightContext: dto.oversightContext } : {}),
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
