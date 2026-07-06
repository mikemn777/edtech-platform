import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { DomainError } from '../../../platform/errors/domain-error';
import { paginate } from '../../../shared/pagination/pagination.dto';
import type { PaginatedResult } from '@edu/types';
import type { UpdateAccountDto } from '../contracts/user.dto';

/**
 * User Management service (module 12; Business Domain Model §2). Account
 * lifecycle, profile updates, and role assignment — all explicit and audited.
 * Role assignment is high-risk (Roles §16.5) and always recorded.
 */
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findById(id: string): Promise<{ id: string; displayName: string; status: string }> {
    const account = await this.prisma.userAccount.findFirst({
      where: { id, isDeleted: false },
    });
    if (!account) throw DomainError.notFound('Account not found.');
    return { id: account.id, displayName: account.displayName, status: account.status };
  }

  async list(page: number, pageSize: number, skip: number): Promise<PaginatedResult<unknown>> {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.userAccount.findMany({
        where: { isDeleted: false },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: { id: true, displayName: true, status: true, createdAt: true },
      }),
      this.prisma.userAccount.count({ where: { isDeleted: false } }),
    ]);
    return paginate(rows, total, page, pageSize);
  }

  async update(
    id: string,
    dto: UpdateAccountDto,
    actorAccountId: string,
    correlationId?: string,
  ): Promise<void> {
    await this.findById(id);
    await this.prisma.userAccount.update({
      where: { id },
      data: {
        ...(dto.displayName !== undefined ? { displayName: dto.displayName } : {}),
        ...(dto.primaryLocaleId !== undefined ? { primaryLocaleId: dto.primaryLocaleId } : {}),
        ...(dto.primaryJurisdictionId !== undefined
          ? { primaryJurisdictionId: dto.primaryJurisdictionId }
          : {}),
        updatedBy: actorAccountId,
      },
    });
    await this.audit.record({
      actorAccountId,
      action: 'user.account.updated',
      entityType: 'UserAccount',
      entityReference: id,
      classification: 'personal',
      correlationId,
    });
  }

  async assignRole(
    accountId: string,
    roleName: string,
    actorAccountId: string,
    correlationId?: string,
  ): Promise<void> {
    await this.findById(accountId);
    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw DomainError.notFound('Role not found.');

    await this.prisma.accountRole.upsert({
      where: {
        accountId_roleId_scopeType_scopeReference: {
          accountId,
          roleId: role.id,
          scopeType: 'PLATFORM',
          scopeReference: null as unknown as string,
        },
      },
      update: { isDeleted: false, updatedBy: actorAccountId },
      create: { accountId, roleId: role.id, createdBy: actorAccountId },
    });

    // High-risk action — always audited (Roles §16.5, §13.3).
    await this.audit.record({
      actorAccountId,
      action: 'user.role.assigned',
      entityType: 'AccountRole',
      entityReference: accountId,
      authorityContext: { role: roleName },
      classification: 'operational',
      correlationId,
    });
  }
}
