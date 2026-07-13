import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { PolicyService } from '../../../shared/authz/policy.service';
import { DomainError } from '../../../platform/errors/domain-error';
import type { AuthenticatedPrincipal } from '../../../shared/identity/request-context';
import type { CreateAssignmentDto, GradeAssignmentDto, SubmitAssignmentDto } from '../contracts/assignment.dto';

/**
 * Homework / Assignments service. A tutor assigns homework to a student, the
 * student submits their work, and the tutor grades it (score 0–100 + feedback).
 * Learner data is classified minor_related and audited (Constitution Art. VI).
 *
 * Object-level authorization (P0-1): holding `assignment.assignment.read`/
 * `.manage` proves the caller may use the feature at all, not that they may
 * touch any given student's or tutor's records — every cross-account lookup
 * here is additionally checked against the specific resource.
 */
@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly policy: PolicyService,
  ) {}

  private async studentIdForAccount(accountId: string): Promise<string> {
    const student = await this.prisma.studentProfile.findFirst({ where: { accountId, isDeleted: false } });
    if (!student) throw DomainError.notFound('No student found with that code. Ask the student to open their dashboard first.');
    return student.id;
  }

  // ---- Tutor: create + list authored ----
  async create(dto: CreateAssignmentDto, actorAccountId: string, correlationId?: string) {
    const studentId = await this.studentIdForAccount(dto.studentAccountId);
    const a = await this.prisma.assignment.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        courseId: dto.courseId ?? null,
        studentId,
        assignedByAccountId: actorAccountId,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
        createdBy: actorAccountId,
      },
    });
    await this.audit.record({
      actorAccountId,
      action: 'assignment.created',
      entityType: 'Assignment',
      entityReference: a.id,
      classification: 'minor_related',
      correlationId,
    });
    return { id: a.id, status: a.status };
  }

  async listAuthored(actorAccountId: string) {
    const rows = await this.prisma.assignment.findMany({
      where: { assignedByAccountId: actorAccountId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: { submissions: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    return rows.map((a) => this.toView(a));
  }

  // ---- Student: list own + submit ----
  async listForStudent(studentId: string, actor: AuthenticatedPrincipal) {
    const allowed =
      (await this.policy.canActOnStudentProfile(actor, studentId)) ||
      (await this.hasAssignedStudentBefore(studentId, actor.accountId));
    if (!allowed) throw DomainError.forbidden();

    const rows = await this.prisma.assignment.findMany({
      where: { studentId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: { submissions: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    return rows.map((a) => this.toView(a));
  }

  /** A tutor may view a student's homework list once they've assigned them
   * homework at least once — this is the teaching relationship, distinct from
   * guardianship (Roles §3.3 relationship scope is guardian-specific). */
  private async hasAssignedStudentBefore(studentId: string, tutorAccountId: string): Promise<boolean> {
    const row = await this.prisma.assignment.findFirst({
      where: { studentId, assignedByAccountId: tutorAccountId, isDeleted: false },
      select: { id: true },
    });
    return !!row;
  }

  async submit(assignmentId: string, actorAccountId: string, dto: SubmitAssignmentDto, correlationId?: string) {
    const studentId = await this.studentIdForAccount(actorAccountId);
    const assignment = await this.prisma.assignment.findFirst({ where: { id: assignmentId, isDeleted: false } });
    if (!assignment) throw DomainError.notFound('Assignment not found.');
    if (assignment.studentId !== studentId) throw DomainError.forbidden('This assignment is not assigned to you.');

    const existing = await this.prisma.assignmentSubmission.findFirst({
      where: { assignmentId, studentId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) {
      await this.prisma.assignmentSubmission.update({
        where: { id: existing.id },
        data: { contentReference: dto.contentReference, submittedAt: new Date(), status: 'submitted', updatedBy: actorAccountId, recordVersion: { increment: 1 } },
      });
    } else {
      await this.prisma.assignmentSubmission.create({
        data: { assignmentId, studentId, contentReference: dto.contentReference, submittedAt: new Date(), status: 'submitted', createdBy: actorAccountId },
      });
    }
    await this.prisma.assignment.update({ where: { id: assignmentId }, data: { status: 'SUBMITTED', updatedBy: actorAccountId, recordVersion: { increment: 1 } } });
    await this.audit.record({
      actorAccountId,
      action: 'assignment.submitted',
      entityType: 'Assignment',
      entityReference: assignmentId,
      classification: 'minor_related',
      correlationId,
    });
    return { id: assignmentId, status: 'SUBMITTED' };
  }

  // ---- Tutor: grade ----
  async grade(assignmentId: string, actor: AuthenticatedPrincipal, dto: GradeAssignmentDto, correlationId?: string) {
    const assignment = await this.prisma.assignment.findFirst({ where: { id: assignmentId, isDeleted: false } });
    if (!assignment) throw DomainError.notFound('Assignment not found.');
    // Only the tutor who assigned this homework (or an operational role) may grade it —
    // otherwise any `assignment.assignment.manage` holder could grade any student's work.
    this.policy.assertIsSelfOrOperational(actor, assignment.assignedByAccountId);

    const actorAccountId = actor.accountId;
    const submission = await this.prisma.assignmentSubmission.findFirst({
      where: { assignmentId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
    if (!submission) throw DomainError.validation('The student has not submitted this assignment yet.');
    await this.prisma.assignmentSubmission.update({
      where: { id: submission.id },
      data: { score: dto.score, feedback: dto.feedback ?? null, status: 'graded', updatedBy: actorAccountId, recordVersion: { increment: 1 } },
    });
    await this.prisma.assignment.update({ where: { id: assignmentId }, data: { status: 'GRADED', updatedBy: actorAccountId, recordVersion: { increment: 1 } } });
    await this.audit.record({
      actorAccountId,
      action: 'assignment.graded',
      entityType: 'Assignment',
      entityReference: assignmentId,
      authorityContext: { score: dto.score },
      classification: 'minor_related',
      correlationId,
    });
    return { id: assignmentId, status: 'GRADED' };
  }

  private toView(a: {
    id: string; title: string; description: string | null; studentId: string; courseId: string | null;
    dueAt: Date | null; status: string; createdAt: Date;
    submissions: { status: string; score: unknown; feedback: string | null; submittedAt: Date | null; contentReference: string | null }[];
  }) {
    const sub = a.submissions[0];
    return {
      id: a.id,
      title: a.title,
      description: a.description,
      studentId: a.studentId,
      courseId: a.courseId,
      dueAt: a.dueAt,
      status: a.status,
      createdAt: a.createdAt,
      submission: sub
        ? {
            status: sub.status,
            score: sub.score !== null && sub.score !== undefined ? Number(sub.score) : null,
            feedback: sub.feedback,
            submittedAt: sub.submittedAt,
            contentReference: sub.contentReference,
          }
        : null,
    };
  }
}
