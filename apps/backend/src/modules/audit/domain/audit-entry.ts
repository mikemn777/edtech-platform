/**
 * Audit entry (Business Domain Model §28; Constitution Art. 6.5).
 * A technology-neutral description of a significant action to be recorded
 * append-only and tamper-evident. No role has unaudited power (Roles §13.3).
 */
export interface AuditEntry {
  actorAccountId?: string;
  action: string;
  entityType: string;
  entityReference?: string;
  authorityContext?: Record<string, unknown>;
  jurisdictionId?: string;
  classification?: 'personal' | 'financial' | 'minor_related' | 'operational';
  correlationId?: string;
}
