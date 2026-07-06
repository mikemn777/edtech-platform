import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { DomainError } from '../../../platform/errors/domain-error';
import type { UpsertSettingDto, ConfigScopeDto } from '../contracts/setting.dto';

/**
 * Settings service (module 15; Business Domain Model §26). Operationalizes
 * "Configurability as Law" (Constitution Art. X): governed, validated, versioned
 * settings at scope. Every change is audited.
 */
@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async resolve(
    settingKey: string,
    scopeType: ConfigScopeDto,
    scopeReference?: string,
  ): Promise<unknown> {
    const setting = await this.prisma.setting.findFirst({
      where: { settingKey, scopeType, scopeReference: scopeReference ?? null, isDeleted: false },
    });
    if (!setting) throw DomainError.notFound('Setting not found for the given scope.');
    return setting.value;
  }

  async upsert(dto: UpsertSettingDto, actorAccountId: string, correlationId?: string) {
    const setting = await this.prisma.setting.upsert({
      where: {
        settingKey_scopeType_scopeReference: {
          settingKey: dto.settingKey,
          scopeType: dto.scopeType,
          scopeReference: (dto.scopeReference ?? null) as unknown as string,
        },
      },
      update: { value: dto.value, updatedBy: actorAccountId, recordVersion: { increment: 1 } },
      create: {
        settingKey: dto.settingKey,
        scopeType: dto.scopeType,
        scopeReference: dto.scopeReference ?? null,
        value: dto.value,
        createdBy: actorAccountId,
      },
    });
    await this.audit.record({
      actorAccountId,
      action: 'settings.upserted',
      entityType: 'Setting',
      entityReference: setting.id,
      authorityContext: { settingKey: dto.settingKey, scopeType: dto.scopeType },
      correlationId,
    });
    return setting;
  }
}
