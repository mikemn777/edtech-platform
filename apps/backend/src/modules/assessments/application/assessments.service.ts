import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { DomainError } from '../../../platform/errors/domain-error';
import type { AddQuestionDto, CreateAssessmentDto, SubmitAssessmentDto } from '../contracts/assessment.dto';

/**
 * Quizzes / Assessments service. A tutor builds a multiple-choice quiz; students
 * take it and it is auto-graded server-side (answer keys never leave the server).
 * Learner submissions are classified minor_related and audited (Art. VI).
 */
@Injectable()
export class AssessmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private async studentIdForAccount(accountId: string): Promise<string> {
    const s = await this.prisma.studentProfile.findFirst({ where: { accountId, isDeleted: false } });
    if (!s) throw DomainError.notFound('No student profile found. Open your dashboard first.');
    return s.id;
  }

  private async ownedAssessment(id: string, actorAccountId: string) {
    const a = await this.prisma.assessment.findFirst({ where: { id, isDeleted: false } });
    if (!a) throw DomainError.notFound('Quiz not found.');
    if (a.ownerAccountId !== actorAccountId) throw DomainError.forbidden('This quiz belongs to another tutor.');
    return a;
  }

  // ---- Tutor: build ----
  async create(dto: CreateAssessmentDto, actorAccountId: string, correlationId?: string) {
    const a = await this.prisma.assessment.create({
      data: { title: dto.title, ownerAccountId: actorAccountId, kind: 'QUIZ', status: 'PUBLISHED', courseId: dto.courseId ?? null, createdBy: actorAccountId },
    });
    await this.audit.record({ actorAccountId, action: 'assessment.created', entityType: 'Assessment', entityReference: a.id, correlationId });
    return { id: a.id };
  }

  async addQuestion(assessmentId: string, dto: AddQuestionDto, actorAccountId: string) {
    await this.ownedAssessment(assessmentId, actorAccountId);
    if (dto.correctIndex >= dto.options.length) throw DomainError.validation('correctIndex is outside the provided options.');
    const count = await this.prisma.assessmentQuestion.count({ where: { assessmentId, isDeleted: false } });
    const q = await this.prisma.assessmentQuestion.create({
      data: {
        assessmentId,
        prompt: dto.prompt,
        questionType: 'MULTIPLE_CHOICE',
        options: dto.options,
        answerKey: { correctIndex: dto.correctIndex },
        points: dto.points ?? 1,
        sequenceOrder: count + 1,
        createdBy: actorAccountId,
      },
    });
    return { id: q.id, sequenceOrder: q.sequenceOrder };
  }

  async listAuthored(actorAccountId: string) {
    const rows = await this.prisma.assessment.findMany({
      where: { ownerAccountId: actorAccountId, kind: 'QUIZ', isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { questions: true, submissions: true } } },
    });
    return rows.map((a) => ({ id: a.id, title: a.title, status: a.status, questionCount: a._count.questions, submissionCount: a._count.submissions, createdAt: a.createdAt }));
  }

  async results(assessmentId: string, actorAccountId: string) {
    await this.ownedAssessment(assessmentId, actorAccountId);
    const subs = await this.prisma.assessmentSubmission.findMany({
      where: { assessmentId, isDeleted: false },
      orderBy: { submittedAt: 'desc' },
    });
    return subs.map((s) => ({ studentId: s.studentId, score: s.score !== null ? Number(s.score) : null, maxScore: s.maxScore !== null ? Number(s.maxScore) : null, submittedAt: s.submittedAt }));
  }

  // ---- Student: discover + take ----
  async listPublished() {
    const rows = await this.prisma.assessment.findMany({
      where: { status: 'PUBLISHED', kind: 'QUIZ', isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { questions: true } } },
    });
    return rows.filter((a) => a._count.questions > 0).map((a) => ({ id: a.id, title: a.title, questionCount: a._count.questions }));
  }

  async getForTaking(id: string) {
    const a = await this.prisma.assessment.findFirst({
      where: { id, status: 'PUBLISHED', kind: 'QUIZ', isDeleted: false },
      include: { questions: { where: { isDeleted: false }, orderBy: { sequenceOrder: 'asc' } } },
    });
    if (!a) throw DomainError.notFound('Quiz not found.');
    return {
      id: a.id,
      title: a.title,
      questions: a.questions.map((q) => ({ id: q.id, prompt: q.prompt, options: (q.options as string[]) ?? [], points: q.points })),
    };
  }

  async submit(id: string, actorAccountId: string, dto: SubmitAssessmentDto, correlationId?: string) {
    const studentId = await this.studentIdForAccount(actorAccountId);
    const a = await this.prisma.assessment.findFirst({
      where: { id, status: 'PUBLISHED', kind: 'QUIZ', isDeleted: false },
      include: { questions: { where: { isDeleted: false } } },
    });
    if (!a) throw DomainError.notFound('Quiz not found.');

    const chosen = new Map<string, number>();
    dto.questionIds.forEach((qid, i) => chosen.set(qid, dto.selectedIndexes[i]));

    const submission = await this.prisma.assessmentSubmission.create({
      data: { assessmentId: id, studentId, status: 'graded', submittedAt: new Date(), createdBy: actorAccountId },
    });

    let score = 0;
    let maxScore = 0;
    let correct = 0;
    for (const q of a.questions) {
      maxScore += q.points;
      const key = (q.answerKey as { correctIndex: number } | null)?.correctIndex;
      const sel = chosen.get(q.id);
      const isCorrect = sel !== undefined && key !== undefined && sel === key;
      const awarded = isCorrect ? q.points : 0;
      if (isCorrect) correct += 1;
      score += awarded;
      await this.prisma.assessmentAnswer.create({
        data: { submissionId: submission.id, questionId: q.id, answer: { selectedIndex: sel ?? null }, isCorrect, awardedPoints: awarded, createdBy: actorAccountId },
      });
    }

    await this.prisma.assessmentSubmission.update({ where: { id: submission.id }, data: { score, maxScore } });
    await this.audit.record({ actorAccountId, action: 'assessment.submitted', entityType: 'AssessmentSubmission', entityReference: submission.id, classification: 'minor_related', correlationId });

    return { score, maxScore, correct, total: a.questions.length };
  }

  async mySubmissions(actorAccountId: string) {
    const studentId = await this.studentIdForAccount(actorAccountId);
    const subs = await this.prisma.assessmentSubmission.findMany({
      where: { studentId, isDeleted: false },
      orderBy: { submittedAt: 'desc' },
      include: { assessment: { select: { id: true, title: true } } },
    });
    return subs.map((s) => ({
      assessmentId: s.assessment.id,
      title: s.assessment.title,
      score: s.score !== null ? Number(s.score) : null,
      maxScore: s.maxScore !== null ? Number(s.maxScore) : null,
      submittedAt: s.submittedAt,
    }));
  }
}
