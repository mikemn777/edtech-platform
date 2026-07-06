import { Global, Module } from '@nestjs/common';
import { AuditService } from './application/audit.service';

/**
 * Audit module (module 16). Global so any domain module can record significant
 * actions without coupling (Business Domain Model §28).
 */
@Global()
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
