import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { PolicyService } from '../../../shared/authz/policy.service';
import { DomainError } from '../../../platform/errors/domain-error';
import type { AuthenticatedPrincipal } from '../../../shared/identity/request-context';
import type {
  AddPathStepDto,
  AddProgramCourseDto,
  CourseStatusDto,
  CreateCourseDto,
  CreatePathDto,
  CreateProgramDto,
  EnrollDto,
  EnrollableTypeDto,
} from '../contracts/curriculum.dto';

/**
 * Curriculum service — Courses, Programs, Learning Paths, Enrollment
 * (Business Domain Model §11-12). Structured educational offerings. Educational
 * alignment/accreditation RULES per market are Pending Business Decisions
 * (BR-104); this manages structure and lifecycle only.
 *
 * Object-level authorization (P0-1): authoring content is self-scoped (only
 * the owning tutor, or staff, may change it); enrollment is student-scoped
 * (only the student themselves, an active guardian, or staff).
 */
@Injectable()
export class CurriculumService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly policy: PolicyService,
  ) {}

  // ---- Courses ----
  async createCourse(dto: CreateCourseDto, principal: AuthenticatedPrincipal, correlationId?: string) {
    const actor = principal.accountId;
    const course = await this.prisma.course.create({
      data: {
        title: dto.title,
        subject: dto.subject.toLowerCase().trim(),
        description: dto.description ?? null,
        ownerAccountId: actor,
        jurisdictionId: dto.jurisdictionId ?? null,
        createdBy: actor,
      },
    });
    await this.audit.record({ actorAccountId: actor, action: 'course.created', entityType: 'Course', entityReference: course.id, correlationId });
    return { id: course.id, status: course.status };
  }

  async publishCourse(courseId: string, status: CourseStatusDto, principal: AuthenticatedPrincipal, correlationId?: string) {
    const actor = principal.accountId;
    const course = await this.prisma.course.findFirst({ where: { id: courseId, isDeleted: false } });
    if (!course) throw DomainError.notFound('Course not found.');
    // Only the authoring tutor (or staff) may change a course's publication
    // status — otherwise any COURSE_MANAGE holder could retire a rival's course.
    this.policy.assertIsSelfOrOperational(principal, course.ownerAccountId);
    const updated = await this.prisma.course.update({
      where: { id: courseId },
      data: { status, updatedBy: actor, recordVersion: { increment: 1 } },
    });
    await this.audit.record({ actorAccountId: actor, action: 'course.status_changed', entityType: 'Course', entityReference: courseId, authorityContext: { status }, correlationId });
    return { id: updated.id, status: updated.status };
  }

  async listPublishedCourses(subject?: string) {
    const rows = await this.prisma.course.findMany({
      where: { status: 'PUBLISHED', isDeleted: false, ...(subject ? { subject: subject.toLowerCase() } : {}) },
      orderBy: { title: 'asc' },
      take: 100,
    });
    return rows.map((c) => ({ id: c.id, title: c.title, subject: c.subject, description: c.description }));
  }

  // ---- Programs ----
  async createProgram(dto: CreateProgramDto, principal: AuthenticatedPrincipal, correlationId?: string) {
    const actor = principal.accountId;
    const program = await this.prisma.program.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        ownerAccountId: actor,
        educationalSystemId: dto.educationalSystemId ?? null,
        createdBy: actor,
      },
    });
    await this.audit.record({ actorAccountId: actor, action: 'program.created', entityType: 'Program', entityReference: program.id, correlationId });
    return { id: program.id, status: program.status };
  }

  async addProgramCourse(programId: string, dto: AddProgramCourseDto, principal: AuthenticatedPrincipal, correlationId?: string) {
    const actor = principal.accountId;
    const [program, course] = await Promise.all([
      this.prisma.program.findFirst({ where: { id: programId, isDeleted: false } }),
      this.prisma.course.findFirst({ where: { id: dto.courseId, isDeleted: false } }),
    ]);
    if (!program) throw DomainError.notFound('Program not found.');
    if (!course) throw DomainError.notFound('Course not found.');
    // Only the program's owner (or staff) may compose it.
    this.policy.assertIsSelfOrOperational(principal, program.ownerAccountId);
    try {
      const link = await this.prisma.programCourse.create({
        data: { programId, courseId: dto.courseId, sequenceOrder: dto.sequenceOrder, createdBy: actor },
      });
      await this.audit.record({ actorAccountId: actor, action: 'program.course_added', entityType: 'ProgramCourse', entityReference: link.id, correlationId });
      return { id: link.id };
    } catch {
      throw DomainError.conflict('A course already occupies that sequence position.');
    }
  }

  // ---- Learning Paths ----
  async createPath(dto: CreatePathDto, principal: AuthenticatedPrincipal, correlationId?: string) {
    const actor = principal.accountId;
    const path = await this.prisma.learningPath.create({
      data: { title: dto.title, description: dto.description ?? null, ownerAccountId: actor, createdBy: actor },
    });
    await this.audit.record({ actorAccountId: actor, action: 'path.created', entityType: 'LearningPath', entityReference: path.id, correlationId });
    return { id: path.id, status: path.status };
  }

  async addPathStep(pathId: string, dto: AddPathStepDto, principal: AuthenticatedPrincipal, correlationId?: string) {
    const actor = principal.accountId;
    const path = await this.prisma.learningPath.findFirst({ where: { id: pathId, isDeleted: false } });
    if (!path) throw DomainError.notFound('Learning path not found.');
    // Only the path's owner (or staff) may compose it.
    this.policy.assertIsSelfOrOperational(principal, path.ownerAccountId);
    try {
      const step = await this.prisma.learningPathStep.create({
        data: { pathId, refType: dto.refType, refId: dto.refId ?? null, title: dto.title, sequenceOrder: dto.sequenceOrder, createdBy: actor },
      });
      return { id: step.id };
    } catch {
      throw DomainError.conflict('A step already occupies that sequence position.');
    }
  }

  // ---- Enrollment ----
  async enroll(dto: EnrollDto, principal: AuthenticatedPrincipal, correlationId?: string) {
    const actor = principal.accountId;
    const student = await this.prisma.studentProfile.findFirst({ where: { id: dto.studentId, isDeleted: false } });
    if (!student) throw DomainError.notFound('Student profile not found.');
    // Only the student themselves, an active guardian, or staff may enroll them (A2 pattern).
    if (!(await this.policy.canActOnStudentAccount(principal, student.accountId))) {
      throw DomainError.forbidden('You may only enroll your own student profile.');
    }

    // Validate the target exists and is published.
    await this.assertEnrollableExists(dto.enrollableType, dto.enrollableId);

    const existing = await this.prisma.enrollment.findUnique({
      where: {
        studentId_enrollableType_enrollableId: {
          studentId: dto.studentId,
          enrollableType: dto.enrollableType,
          enrollableId: dto.enrollableId,
        },
      },
    });
    if (existing && !existing.isDeleted && existing.status === 'ACTIVE') {
      throw DomainError.conflict('Student is already enrolled.');
    }

    const enrollment = existing
      ? await this.prisma.enrollment.update({ where: { id: existing.id }, data: { status: 'ACTIVE', isDeleted: false, updatedBy: actor } })
      : await this.prisma.enrollment.create({ data: { studentId: dto.studentId, enrollableType: dto.enrollableType, enrollableId: dto.enrollableId, createdBy: actor } });

    await this.audit.record({ actorAccountId: actor, action: 'enrollment.created', entityType: 'Enrollment', entityReference: enrollment.id, classification: 'minor_related', correlationId });
    return { id: enrollment.id, status: enrollment.status };
  }

  async listEnrollments(studentId: string, principal: AuthenticatedPrincipal) {
    if (!(await this.policy.canActOnStudentProfile(principal, studentId))) throw DomainError.forbidden();
    const rows = await this.prisma.enrollment.findMany({
      where: { studentId, isDeleted: false },
      orderBy: { enrolledAt: 'desc' },
    });
    return rows.map((e) => ({ id: e.id, type: e.enrollableType, enrollableId: e.enrollableId, status: e.status, enrolledAt: e.enrolledAt }));
  }

  private async assertEnrollableExists(type: EnrollableTypeDto, id: string): Promise<void> {
    if (type === 'COURSE') {
      const c = await this.prisma.course.findFirst({ where: { id, isDeleted: false, status: 'PUBLISHED' } });
      if (!c) throw DomainError.validation('Course is not available for enrollment.');
    } else if (type === 'PROGRAM') {
      const p = await this.prisma.program.findFirst({ where: { id, isDeleted: false, status: 'PUBLISHED' } });
      if (!p) throw DomainError.validation('Program is not available for enrollment.');
    } else {
      const p = await this.prisma.learningPath.findFirst({ where: { id, isDeleted: false, status: 'PUBLISHED' } });
      if (!p) throw DomainError.validation('Learning path is not available for enrollment.');
    }
  }
}
