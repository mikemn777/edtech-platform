import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { DomainError } from '../../../platform/errors/domain-error';

const GUARDIAN_OF = 'guardian_of';

/**
 * Parent–Student Relationships service (Business Domain Model §2). Manages the
 * structural guardianship link (reusing the Phase 1 AccountRelationship model).
 *
 * IMPORTANT (Constitution Art. VI, IX; Roles §16.2; Requirements BR-102/BR-003):
 * The authoritative rules that govern WHO may establish guardianship, what
 * consent is required, and what oversight it confers are NOT yet established —
 * they are Pending Business/Legal Decisions. Because this concerns minors, the
 * link is created as PENDING and confers NO automatic oversight authority until
 * an authoritative rule is logged. This is the most-protective default, not a
 * guess at the rule.
 */
@Injectable()
export class RelationshipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async createGuardianship(
    parentAccountId: string,
    studentAccountId: string,
    actorAccountId: string,
    correlationId?: string,
  ) {
    if (parentAccountId === studentAccountId) {
      throw DomainError.validation('A guardianship cannot link an account to itself.');
    }

    // Both endpoints must exist and hold the appropriate specialization.
    const [parent, student] = await Promise.all([
      this.prisma.parentProfile.findFirst({ where: { accountId: parentAccountId, isDeleted: false } }),
      this.prisma.studentProfile.findFirst({ where: { accountId: studentAccountId, isDeleted: false } }),
    ]);
    if (!parent) throw DomainError.notFound('Parent profile not found for the given account.');
    if (!student) throw DomainError.notFound('Student profile not found for the given account.');

    const existing = await this.prisma.accountRelationship.findFirst({
      where: {
        fromAccountId: parentAccountId,
        toAccountId: studentAccountId,
        relationshipType: GUARDIAN_OF,
        isDeleted: false,
      },
    });
    if (existing) throw DomainError.conflict('Guardianship link already exists.');

    const link = await this.prisma.accountRelationship.create({
      data: {
        fromAccountId: parentAccountId,
        toAccountId: studentAccountId,
        relationshipType: GUARDIAN_OF,
        // Most-protective default: PENDING, not ACTIVE. Confers no oversight until
        // an authoritative guardianship rule is established (BR-102, BR-003).
        status: 'pending',
        createdBy: actorAccountId,
      },
    });

    await this.audit.record({
      actorAccountId,
      action: 'relationship.guardianship.created_pending',
      entityType: 'AccountRelationship',
      entityReference: link.id,
      authorityContext: { parentAccountId, studentAccountId, note: 'rules PBD; no oversight granted' },
      classification: 'minor_related',
      correlationId,
    });
    return { id: link.id, status: link.status };
  }

  async listForParent(parentAccountId: string) {
    const rows = await this.prisma.accountRelationship.findMany({
      where: {
        fromAccountId: parentAccountId,
        relationshipType: GUARDIAN_OF,
        isDeleted: false,
      },
      orderBy: { establishedAt: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      studentAccountId: r.toAccountId,
      status: r.status,
      establishedAt: r.establishedAt,
    }));
  }
}
