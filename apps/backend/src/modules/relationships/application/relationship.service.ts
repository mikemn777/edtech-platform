import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { PolicyService } from '../../../shared/authz/policy.service';
import { DomainError } from '../../../platform/errors/domain-error';
import type { AuthenticatedPrincipal } from '../../../shared/identity/request-context';

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
    private readonly policy: PolicyService,
  ) {}

  async createGuardianship(
    parentAccountId: string,
    studentAccountId: string,
    principal: AuthenticatedPrincipal,
    correlationId?: string,
  ) {
    const actorAccountId = principal.accountId;
    // Only the parent themselves (or staff, e.g. during verification) may claim
    // a guardianship link under their account — otherwise any RELATIONSHIP_MANAGE
    // holder could plant a link attributed to an account that isn't theirs (A1).
    this.policy.assertIsSelfOrOperational(principal, parentAccountId);
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

    // Look up regardless of isDeleted: the DB now enforces uniqueness only
    // among LIVE rows (P0-2), so a previously revoked (soft-deleted) link for
    // this exact pair must be reactivated in place rather than re-created —
    // a raw insert would collide with it at the DB level.
    const existing = await this.prisma.accountRelationship.findFirst({
      where: {
        fromAccountId: parentAccountId,
        toAccountId: studentAccountId,
        relationshipType: GUARDIAN_OF,
      },
    });
    if (existing && !existing.isDeleted) {
      throw DomainError.conflict('Guardianship link already exists.');
    }

    const link = existing
      ? await this.prisma.accountRelationship.update({
          where: { id: existing.id },
          data: {
            // Most-protective default: PENDING, not ACTIVE (BR-102, BR-003).
            status: 'pending',
            isDeleted: false,
            deletedAt: null,
            deletedBy: null,
            updatedBy: actorAccountId,
            recordVersion: { increment: 1 },
          },
        })
      : await this.prisma.accountRelationship.create({
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

  async listForParent(parentAccountId: string, principal: AuthenticatedPrincipal) {
    this.policy.assertIsSelfOrOperational(principal, parentAccountId);
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
