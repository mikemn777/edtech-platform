import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { PolicyService } from '../../../shared/authz/policy.service';
import { DomainError } from '../../../platform/errors/domain-error';
import type { AuthenticatedPrincipal } from '../../../shared/identity/request-context';
import type { CreateGoalDto, GoalStatusDto, RecordProgressDto } from '../contracts/learning.dto';

/**
 * Learning service — Learning Goals + Progress Tracking (Business Domain Model
 * §12-13). Learner data is classified minor_related and audited accordingly
 * (Art. VI). Structural correctness only; no invented pedagogy rules.
 *
 * Object-level authorization (P0-1): goals/progress are the student's own
 * data — every route is scoped to the student themselves, an active
 * guardian, or staff (Roles §3.3).
 */
@Injectable()
export class LearningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly policy: PolicyService,
  ) {}

  private async assertAccessibleStudent(studentId: string, principal: AuthenticatedPrincipal): Promise<void> {
    const student = await this.prisma.studentProfile.findFirst({
      where: { id: studentId, isDeleted: false },
    });
    if (!student) throw DomainError.notFound('Student profile not found.');
    if (!(await this.policy.canActOnStudentAccount(principal, student.accountId))) {
      throw DomainError.forbidden();
    }
  }

  // ---- Goals ----
  async createGoal(studentId: string, dto: CreateGoalDto, principal: AuthenticatedPrincipal, correlationId?: string) {
    await this.assertAccessibleStudent(studentId, principal);
    const actor = principal.accountId;
    const goal = await this.prisma.learningGoal.create({
      data: {
        studentId,
        title: dto.title,
        description: dto.description ?? null,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
        createdBy: actor,
      },
    });
    await this.audit.record({
      actorAccountId: actor,
      action: 'student.goal.created',
      entityType: 'LearningGoal',
      entityReference: goal.id,
      classification: 'minor_related',
      correlationId,
    });
    return { id: goal.id, title: goal.title, status: goal.status };
  }

  async listGoals(studentId: string, principal: AuthenticatedPrincipal) {
    await this.assertAccessibleStudent(studentId, principal);
    const rows = await this.prisma.learningGoal.findMany({
      where: { studentId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      targetDate: g.targetDate,
      status: g.status,
    }));
  }

  async setGoalStatus(goalId: string, status: GoalStatusDto, principal: AuthenticatedPrincipal, correlationId?: string) {
    const goal = await this.prisma.learningGoal.findFirst({ where: { id: goalId, isDeleted: false } });
    if (!goal) throw DomainError.notFound('Goal not found.');
    if (!(await this.policy.canActOnStudentProfile(principal, goal.studentId))) throw DomainError.forbidden();
    const actor = principal.accountId;
    const updated = await this.prisma.learningGoal.update({
      where: { id: goalId },
      data: { status, updatedBy: actor, recordVersion: { increment: 1 } },
    });
    await this.audit.record({
      actorAccountId: actor,
      action: 'student.goal.status_changed',
      entityType: 'LearningGoal',
      entityReference: goalId,
      authorityContext: { status },
      classification: 'minor_related',
      correlationId,
    });
    return { id: updated.id, status: updated.status };
  }

  // ---- Progress Tracking ----
  async recordProgress(studentId: string, dto: RecordProgressDto, principal: AuthenticatedPrincipal, correlationId?: string) {
    await this.assertAccessibleStudent(studentId, principal);
    const actor = principal.accountId;
    if (dto.goalId) {
      const goal = await this.prisma.learningGoal.findFirst({
        where: { id: dto.goalId, studentId, isDeleted: false },
      });
      if (!goal) throw DomainError.validation('Linked goal not found for this student.');
    }
    const record = await this.prisma.progressRecord.create({
      data: {
        studentId,
        goalId: dto.goalId ?? null,
        metricKey: dto.metricKey,
        value: dto.value ?? null,
        note: dto.note ?? null,
        createdBy: actor,
      },
    });
    await this.audit.record({
      actorAccountId: actor,
      action: 'student.progress.recorded',
      entityType: 'ProgressRecord',
      entityReference: record.id,
      classification: 'minor_related',
      correlationId,
    });
    return { id: record.id, metricKey: record.metricKey, recordedAt: record.recordedAt };
  }

  async listProgress(studentId: string, principal: AuthenticatedPrincipal) {
    await this.assertAccessibleStudent(studentId, principal);
    const rows = await this.prisma.progressRecord.findMany({
      where: { studentId, isDeleted: false },
      orderBy: { recordedAt: 'desc' },
      take: 200,
    });
    return rows.map((r) => ({
      id: r.id,
      metricKey: r.metricKey,
      value: r.value !== null ? Number(r.value) : null,
      note: r.note,
      goalId: r.goalId,
      recordedAt: r.recordedAt,
    }));
  }
}
