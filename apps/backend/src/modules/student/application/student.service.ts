import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { DomainError } from '../../../platform/errors/domain-error';
import type { CreateStudentProfileDto, UpdateStudentProfileDto } from '../contracts/student.dto';

/**
 * Student domain service (Business Domain Model §3). Owns the student profile.
 * Minor determination: if a date of birth is provided we still default to the
 * most protective outcome unless an authoritative age rule exists — which is a
 * Pending Business/Legal Decision (Art. VI; BR-003). So `isMinor` defaults true
 * and is only relaxed when such a rule is logged (not in this phase).
 */
@Injectable()
export class StudentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(
    dto: CreateStudentProfileDto,
    actorAccountId: string,
    correlationId?: string,
  ) {
    const accountId = dto.accountId ?? actorAccountId;
    await this.ensureAccountExists(accountId);

    const existing = await this.prisma.studentProfile.findUnique({ where: { accountId } });
    if (existing) throw DomainError.conflict('Student profile already exists for this account.');

    const profile = await this.prisma.studentProfile.create({
      data: {
        accountId,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        // Most-protective default (BR-003). No age rule is authoritatively set.
        isMinor: true,
        jurisdictionId: dto.jurisdictionId ?? null,
        learningContext: dto.learningContext ?? undefined,
        createdBy: actorAccountId,
      },
    });

    await this.audit.record({
      actorAccountId,
      action: 'student.profile.created',
      entityType: 'StudentProfile',
      entityReference: profile.id,
      classification: 'minor_related',
      correlationId,
    });
    return this.toResponse(profile);
  }

  async getByAccount(accountId: string) {
    const profile = await this.prisma.studentProfile.findFirst({
      where: { accountId, isDeleted: false },
    });
    if (!profile) throw DomainError.notFound('Student profile not found.');
    return this.toResponse(profile);
  }

  async getById(id: string) {
    const profile = await this.prisma.studentProfile.findFirst({ where: { id, isDeleted: false } });
    if (!profile) throw DomainError.notFound('Student profile not found.');
    return this.toResponse(profile);
  }

  async update(
    id: string,
    dto: UpdateStudentProfileDto,
    actorAccountId: string,
    correlationId?: string,
  ) {
    await this.getById(id);
    const profile = await this.prisma.studentProfile.update({
      where: { id },
      data: {
        ...(dto.dateOfBirth !== undefined ? { dateOfBirth: new Date(dto.dateOfBirth) } : {}),
        ...(dto.jurisdictionId !== undefined ? { jurisdictionId: dto.jurisdictionId } : {}),
        ...(dto.learningContext !== undefined ? { learningContext: dto.learningContext } : {}),
        updatedBy: actorAccountId,
        recordVersion: { increment: 1 },
      },
    });
    await this.audit.record({
      actorAccountId,
      action: 'student.profile.updated',
      entityType: 'StudentProfile',
      entityReference: id,
      classification: 'minor_related',
      correlationId,
    });
    return this.toResponse(profile);
  }

  private async ensureAccountExists(accountId: string): Promise<void> {
    const account = await this.prisma.userAccount.findFirst({
      where: { id: accountId, isDeleted: false },
    });
    if (!account) throw DomainError.notFound('Account not found.');
  }

  private toResponse(p: {
    id: string;
    accountId: string;
    isMinor: boolean;
    jurisdictionId: string | null;
  }) {
    return { id: p.id, accountId: p.accountId, isMinor: p.isMinor, jurisdictionId: p.jurisdictionId };
  }
}
