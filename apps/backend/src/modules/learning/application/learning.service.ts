import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { DomainError } from '../../../platform/errors/domain-error';
import type { CreateGoalDto, GoalStatusDto, RecordProgressDto } from '../contracts/learning.dto';

/**
 * Learning service — Learning Goals + Progress Tracking (Business Domain Model
 * §12-13). Learner data is classified minor_related and audited accordingly
 * (Art. VI). Structural correctness only; no invented pedagogy rules.
 */
@Injectable()
export class LearningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private async ensureStudent(studentId: string): Promise<void> {
    const student = await this.prisma.studentProfile.findFirst({
      where: { id: studentId, isDeleted: false },
    });
    if (!student) throw DomainError.notFound('Student profile not found.');
  }

  // ---- Goals ----
  async createGoal(studentId: string, dto: CreateGoalDto, actor: string, correlationId?: string) {
    await this.ensureStudent(studentId);
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

  async listGoals(studentId: string) {
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

  async setGoalStatus(goalId: string, status: GoalStatusDto, actor: string, correlationId?: string) {
    const goal = await this.prisma.learningGoal.findFirst({ where: { id: goalId, isDeleted: false } });
    if (!goal) throw DomainError.notFound('Goal not found.');
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
  async recordProgress(studentId: string, dto: RecordProgressDto, actor: string, correlationId?: string) {
    await this.ensureStudent(studentId);
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

  async listProgress(studentId: string) {
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
