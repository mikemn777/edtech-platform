import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import type { AuditEntry } from '../domain/audit-entry';

/**
 * Audit service (module 16). Writes the append-only AuditRecord. Auditing must
 * never break the primary operation, but a failure to audit is logged loudly
 * (accountability is a first-class concern — Art. 6.5).
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditRecord.create({
        data: {
          actorAccountId: entry.actorAccountId ?? null,
          action: entry.action,
          entityType: entry.entityType,
          entityReference: entry.entityReference ?? null,
          authorityContext: entry.authorityContext ?? undefined,
          jurisdictionId: entry.jurisdictionId ?? null,
          classification: entry.classification ?? 'operational',
          correlationId: entry.correlationId ?? null,
        },
      });
    } catch (err) {
      // Do not fail the caller's operation, but never swallow silently.
      this.logger.error({ err, action: entry.action }, 'Failed to write audit record');
    }
  }
}
