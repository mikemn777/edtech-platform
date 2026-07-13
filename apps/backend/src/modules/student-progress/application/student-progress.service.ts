import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { PolicyService } from '../../../shared/authz/policy.service';
import { DomainError } from '../../../platform/errors/domain-error';
import type { AuthenticatedPrincipal } from '../../../shared/identity/request-context';

/**
 * Student Progress service (Business Domain Model §12-13; PHASE3_PROGRESS.md
 * — "aggregate enrollments + assignment/assessment results + ProgressRecord
 * into a progress view"). Read-only; no new writes, no new business rules —
 * purely a summarized view over existing Phase 2b/3 data (Reports domain
 * flavor, same spirit as TutorDashboardService).
 */
@Injectable()
export class StudentProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly policy: PolicyService,
  ) {}

  async summary(studentId: string, principal: AuthenticatedPrincipal) {
    if (!(await this.policy.canActOnStudentProfile(principal, studentId))) throw DomainError.forbidden();

    const [
      enrollmentGroups,
      assignmentGroups,
      submissionScores,
      assessmentScores,
      goalGroups,
      certificateGroups,
      recentProgress,
    ] = await Promise.all([
      this.prisma.enrollment.groupBy({
        by: ['status'],
        where: { studentId, isDeleted: false },
        _count: { _all: true },
      }),
      this.prisma.assignment.groupBy({
        by: ['status'],
        where: { studentId, isDeleted: false },
        _count: { _all: true },
      }),
      this.prisma.assignmentSubmission.aggregate({
        where: { studentId, isDeleted: false, score: { not: null } },
        _avg: { score: true },
        _count: { _all: true },
      }),
      this.prisma.assessmentSubmission.aggregate({
        where: { studentId, isDeleted: false, score: { not: null } },
        _avg: { score: true },
        _count: { _all: true },
      }),
      this.prisma.learningGoal.groupBy({
        by: ['status'],
        where: { studentId, isDeleted: false },
        _count: { _all: true },
      }),
      this.prisma.certificate.groupBy({
        by: ['status'],
        where: { studentId, isDeleted: false },
        _count: { _all: true },
      }),
      this.prisma.progressRecord.findMany({
        where: { studentId, isDeleted: false },
        orderBy: { recordedAt: 'desc' },
        take: 10,
        select: { id: true, metricKey: true, value: true, note: true, recordedAt: true },
      }),
    ]);

    const byStatus = (groups: { status: string; _count: { _all: number } }[]) =>
      groups.reduce<Record<string, number>>((acc, g) => {
        acc[g.status] = g._count._all;
        return acc;
      }, {});

    return {
      studentId,
      enrollments: byStatus(enrollmentGroups),
      assignments: {
        byStatus: byStatus(assignmentGroups),
        gradedSubmissions: submissionScores._count._all,
        averageScore: submissionScores._avg.score !== null ? Number(submissionScores._avg.score) : null,
      },
      assessments: {
        gradedSubmissions: assessmentScores._count._all,
        averageScore: assessmentScores._avg.score !== null ? Number(assessmentScores._avg.score) : null,
      },
      goals: byStatus(goalGroups),
      certificates: byStatus(certificateGroups),
      recentProgress: recentProgress.map((r) => ({
        id: r.id,
        metricKey: r.metricKey,
        value: r.value !== null ? Number(r.value) : null,
        note: r.note,
        recordedAt: r.recordedAt,
      })),
    };
  }
}
