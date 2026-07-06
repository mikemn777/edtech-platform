import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { DomainError } from '../../../platform/errors/domain-error';
import type { AddLanguageDto, AddSubjectDto, RateUnitDto, SetRateDto } from '../contracts/catalog.dto';

/**
 * Tutor Catalog service — Subjects, Languages, Pricing (Business Domain Model §5).
 * These are professional attributes a tutor manages on their own profile. Money
 * is currency-explicit; the SetRate call requires a valid configured currency.
 */
@Injectable()
export class TutorCatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private async ensureTutor(tutorId: string): Promise<void> {
    const tutor = await this.prisma.tutorProfile.findFirst({
      where: { id: tutorId, isDeleted: false },
    });
    if (!tutor) throw DomainError.notFound('Tutor profile not found.');
  }

  // ---- Subjects ----
  async addSubject(tutorId: string, dto: AddSubjectDto, actor: string, correlationId?: string) {
    await this.ensureTutor(tutorId);
    const subject = dto.subject.toLowerCase().trim();
    const existing = await this.prisma.tutorSubject.findUnique({
      where: { tutorId_subject: { tutorId, subject } },
    });
    if (existing && !existing.isDeleted) throw DomainError.conflict('Subject already added.');

    const row = existing
      ? await this.prisma.tutorSubject.update({
          where: { id: existing.id },
          data: { isDeleted: false, status: 'active', updatedBy: actor },
        })
      : await this.prisma.tutorSubject.create({ data: { tutorId, subject, createdBy: actor } });

    await this.audit.record({
      actorAccountId: actor,
      action: 'tutor.subject.added',
      entityType: 'TutorSubject',
      entityReference: row.id,
      correlationId,
    });
    return { id: row.id, subject: row.subject };
  }

  async listSubjects(tutorId: string) {
    const rows = await this.prisma.tutorSubject.findMany({
      where: { tutorId, isDeleted: false, status: 'active' },
      orderBy: { subject: 'asc' },
    });
    return rows.map((r) => ({ id: r.id, subject: r.subject }));
  }

  async removeSubject(subjectId: string, actor: string, correlationId?: string) {
    const row = await this.prisma.tutorSubject.findFirst({ where: { id: subjectId, isDeleted: false } });
    if (!row) throw DomainError.notFound('Subject not found.');
    await this.prisma.tutorSubject.update({
      where: { id: subjectId },
      data: { isDeleted: true, deletedAt: new Date(), deletedBy: actor },
    });
    await this.audit.record({
      actorAccountId: actor,
      action: 'tutor.subject.removed',
      entityType: 'TutorSubject',
      entityReference: subjectId,
      correlationId,
    });
    return { id: subjectId, status: 'removed' };
  }

  // ---- Languages ----
  async addLanguage(tutorId: string, dto: AddLanguageDto, actor: string, correlationId?: string) {
    await this.ensureTutor(tutorId);
    const language = await this.prisma.language.findFirst({
      where: { id: dto.languageId, isDeleted: false, status: 'active' },
    });
    if (!language) throw DomainError.notFound('Language not found or inactive.');

    const existing = await this.prisma.tutorLanguage.findUnique({
      where: { tutorId_languageId: { tutorId, languageId: dto.languageId } },
    });
    if (existing && !existing.isDeleted) throw DomainError.conflict('Language already added.');

    const row = existing
      ? await this.prisma.tutorLanguage.update({
          where: { id: existing.id },
          data: { isDeleted: false, proficiency: dto.proficiency, status: 'active', updatedBy: actor },
        })
      : await this.prisma.tutorLanguage.create({
          data: { tutorId, languageId: dto.languageId, proficiency: dto.proficiency, createdBy: actor },
        });

    await this.audit.record({
      actorAccountId: actor,
      action: 'tutor.language.added',
      entityType: 'TutorLanguage',
      entityReference: row.id,
      correlationId,
    });
    return { id: row.id, languageId: row.languageId, proficiency: row.proficiency };
  }

  async listLanguages(tutorId: string) {
    const rows = await this.prisma.tutorLanguage.findMany({
      where: { tutorId, isDeleted: false, status: 'active' },
    });
    return rows.map((r) => ({ id: r.id, languageId: r.languageId, proficiency: r.proficiency }));
  }

  // ---- Pricing / Rate ----
  async setRate(tutorId: string, dto: SetRateDto, actor: string, correlationId?: string) {
    await this.ensureTutor(tutorId);
    const currency = await this.prisma.currency.findFirst({
      where: { id: dto.currencyId, isDeleted: false },
    });
    if (!currency) throw DomainError.notFound('Currency not found.');

    // Supersede prior active rate (append-preferring: deactivate then create).
    await this.prisma.$transaction(async (tx) => {
      await tx.tutorRate.updateMany({
        where: { tutorId, status: 'active', isDeleted: false },
        data: { status: 'superseded', updatedBy: actor },
      });
      await tx.tutorRate.create({
        data: {
          tutorId,
          rate: dto.rate,
          currencyId: dto.currencyId,
          unit: dto.unit as unknown as RateUnitDto,
          createdBy: actor,
        },
      });
    });

    await this.audit.record({
      actorAccountId: actor,
      action: 'tutor.rate.set',
      entityType: 'TutorRate',
      entityReference: tutorId,
      authorityContext: { unit: dto.unit },
      correlationId,
    });
    return { tutorId, rate: dto.rate, currencyId: dto.currencyId, unit: dto.unit };
  }

  async getActiveRate(tutorId: string) {
    const rate = await this.prisma.tutorRate.findFirst({
      where: { tutorId, status: 'active', isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
    if (!rate) return null;
    return {
      rate: Number(rate.rate),
      currencyId: rate.currencyId,
      unit: rate.unit,
    };
  }
}
