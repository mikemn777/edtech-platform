import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { DomainError } from '../../../platform/errors/domain-error';
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
 */
@Injectable()
export class CurriculumService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ---- Courses ----
  async createCourse(dto: CreateCourseDto, actor: string, correlationId?: string) {
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

  async publishCourse(courseId: string, status: CourseStatusDto, actor: string, correlationId?: string) {
    const course = await this.prisma.course.findFirst({ where: { id: courseId, isDeleted: false } });
    if (!course) throw DomainError.notFound('Course not found.');
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
  async createProgram(dto: CreateProgramDto, actor: string, correlationId?: string) {
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

  async addProgramCourse(programId: string, dto: AddProgramCourseDto, actor: string, correlationId?: string) {
    const [program, course] = await Promise.all([
      this.prisma.program.findFirst({ where: { id: programId, isDeleted: false } }),
      this.prisma.course.findFirst({ where: { id: dto.courseId, isDeleted: false } }),
    ]);
    if (!program) throw DomainError.notFound('Program not found.');
    if (!course) throw DomainError.notFound('Course not found.');
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
  async createPath(dto: CreatePathDto, actor: string, correlationId?: string) {
    const path = await this.prisma.learningPath.create({
      data: { title: dto.title, description: dto.description ?? null, ownerAccountId: actor, createdBy: actor },
    });
    await this.audit.record({ actorAccountId: actor, action: 'path.created', entityType: 'LearningPath', entityReference: path.id, correlationId });
    return { id: path.id, status: path.status };
  }

  async addPathStep(pathId: string, dto: AddPathStepDto, actor: string, correlationId?: string) {
    const path = await this.prisma.learningPath.findFirst({ where: { id: pathId, isDeleted: false } });
    if (!path) throw DomainError.notFound('Learning path not found.');
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
  async enroll(dto: EnrollDto, actor: string, correlationId?: string) {
    const student = await this.prisma.studentProfile.findFirst({ where: { id: dto.studentId, isDeleted: false } });
    if (!student) throw DomainError.notFound('Student profile not found.');

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

  async listEnrollments(studentId: string) {
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
