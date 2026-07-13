import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { PolicyService } from '../../../shared/authz/policy.service';
import { DomainError } from '../../../platform/errors/domain-error';
import type { AuthenticatedPrincipal } from '../../../shared/identity/request-context';

const GUARDIAN_OF = 'guardian_of';

/**
 * Child Monitoring service (Business Domain Model §4; Parent portal).
 *
 * A parent may view a linked student's learning ONLY through an ACTIVE
 * guardianship link. Because the rules that ACTIVATE guardianship and define the
 * SCOPE of oversight are Pending Business/Legal Decisions (BR-102; Art. VI),
 * guardianships are created PENDING (Phase 2 relationships module) and confer no
 * access. This service therefore fails closed: without an authoritative ACTIVE
 * link, monitoring is denied (most-protective — Roles §16.2, BR-003).
 */
@Injectable()
export class ChildMonitoringService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly policy: PolicyService,
  ) {}

  async monitorChild(
    parentAccountId: string,
    studentAccountId: string,
    principal: AuthenticatedPrincipal,
    correlationId?: string,
  ) {
    const actorAccountId = principal.accountId;
    // 0. The caller must BE the parent in the URL (or staff) — otherwise any
    //    CHILD_MONITOR_READ holder could pass another parent's account id and,
    //    once guardianship activation rules exist, monitor a child that isn't
    //    theirs (A1).
    this.policy.assertIsSelfOrOperational(principal, parentAccountId);

    // 1. There must be a guardianship link.
    const link = await this.prisma.accountRelationship.findFirst({
      where: {
        fromAccountId: parentAccountId,
        toAccountId: studentAccountId,
        relationshipType: GUARDIAN_OF,
        isDeleted: false,
      },
    });
    if (!link) throw DomainError.forbidden('No guardianship link exists.');

    // 2. The link must be authoritatively ACTIVE. Absent an authoritative
    //    activation rule (PBD), links remain 'pending' and oversight is denied.
    if (link.status !== 'active') {
      // Audit the denied attempt (minor-sensitive access attempt).
      await this.audit.record({
        actorAccountId,
        action: 'parent.child.monitor.denied_pending_rule',
        entityType: 'AccountRelationship',
        entityReference: link.id,
        authorityContext: { reason: 'guardianship not active; oversight rule is PBD' },
        classification: 'minor_related',
        correlationId,
      });
      throw DomainError.forbidden(
        'Guardianship oversight is not active. The activation and oversight rules are pending an authoritative decision.',
      );
    }

    // 3. Only reachable once an authoritative rule sets a link ACTIVE. Returns a
    //    privacy-bounded summary of the linked student's learning.
    const student = await this.prisma.studentProfile.findFirst({
      where: { accountId: studentAccountId, isDeleted: false },
    });
    if (!student) throw DomainError.notFound('Student profile not found.');

    const [goals, recentProgress, upcomingBookings] = await Promise.all([
      this.prisma.learningGoal.count({ where: { studentId: student.id, isDeleted: false, status: 'ACTIVE' } }),
      this.prisma.progressRecord.count({ where: { studentId: student.id, isDeleted: false } }),
      this.prisma.booking.count({
        where: { studentId: student.id, isDeleted: false, status: { in: ['REQUESTED', 'CONFIRMED'] } },
      }),
    ]);

    await this.audit.record({
      actorAccountId,
      action: 'parent.child.monitor.viewed',
      entityType: 'StudentProfile',
      entityReference: student.id,
      classification: 'minor_related',
      correlationId,
    });

    return {
      studentProfileId: student.id,
      summary: { activeGoals: goals, progressEntries: recentProgress, upcomingBookings },
    };
  }
}
