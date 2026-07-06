import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { DomainError } from '../../../platform/errors/domain-error';
import type { VerificationDecisionDto } from '../contracts/verification.dto';

/**
 * Tutor Verification service (Business Domain Model §6). Governs the trust gate:
 * a tutor may only offer/deliver once VERIFIED (BR-002). The SPECIFIC checks and
 * per-jurisdiction requirements are Pending Business/Legal Decisions (BR-105) —
 * this service governs the case lifecycle and status transitions, not the
 * substantive check criteria (which are not invented here). Every decision is
 * audited as a high-risk operational action (Roles §16.5, §13.3).
 */
@Injectable()
export class TutorVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /** Admin queue: every tutor profile with its status and any open case. */
  async listQueue() {
    const profiles = await this.prisma.tutorProfile.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: { id: true, accountId: true, headline: true, verificationStatus: true, createdAt: true },
    });
    const accounts = await this.prisma.userAccount.findMany({
      where: { id: { in: profiles.map((p) => p.accountId) } },
      select: { id: true, displayName: true },
    });
    const openCases = await this.prisma.verificationCase.findMany({
      where: { tutorId: { in: profiles.map((p) => p.id) }, status: { in: ['OPEN', 'IN_REVIEW'] }, isDeleted: false },
      select: { id: true, tutorId: true },
    });
    const nameBy = new Map(accounts.map((a) => [a.id, a.displayName]));
    const caseBy = new Map(openCases.map((c) => [c.tutorId, c.id]));
    return profiles.map((p) => ({
      id: p.id,
      displayName: nameBy.get(p.accountId) ?? null,
      headline: p.headline,
      verificationStatus: p.verificationStatus,
      createdAt: p.createdAt,
      openCaseId: caseBy.get(p.id) ?? null,
    }));
  }

  async openCase(tutorId: string, jurisdictionId: string | undefined, actorAccountId: string, correlationId?: string) {
    const tutor = await this.prisma.tutorProfile.findFirst({
      where: { id: tutorId, isDeleted: false },
    });
    if (!tutor) throw DomainError.notFound('Tutor profile not found.');

    const openExisting = await this.prisma.verificationCase.findFirst({
      where: { tutorId, status: { in: ['OPEN', 'IN_REVIEW'] }, isDeleted: false },
    });
    if (openExisting) throw DomainError.conflict('An open verification case already exists.');

    const created = await this.prisma.$transaction(async (tx) => {
      const vcase = await tx.verificationCase.create({
        data: { tutorId, jurisdictionId: jurisdictionId ?? null, createdBy: actorAccountId },
      });
      await tx.tutorProfile.update({
        where: { id: tutorId },
        data: { verificationStatus: 'PENDING', updatedBy: actorAccountId },
      });
      return vcase;
    });

    await this.audit.record({
      actorAccountId,
      action: 'tutor.verification.opened',
      entityType: 'VerificationCase',
      entityReference: created.id,
      classification: 'personal',
      correlationId,
    });
    return { id: created.id, status: created.status };
  }

  async decide(
    caseId: string,
    decision: VerificationDecisionDto,
    notes: string | undefined,
    actorAccountId: string,
    correlationId?: string,
  ) {
    const vcase = await this.prisma.verificationCase.findFirst({
      where: { id: caseId, isDeleted: false },
    });
    if (!vcase) throw DomainError.notFound('Verification case not found.');
    if (vcase.status === 'APPROVED' || vcase.status === 'REJECTED') {
      throw DomainError.conflict('Verification case is already decided.');
    }

    const approved = decision === 'APPROVED';
    const result = await this.prisma.$transaction(async (tx) => {
      const updatedCase = await tx.verificationCase.update({
        where: { id: caseId },
        data: {
          status: approved ? 'APPROVED' : 'REJECTED',
          decidedAt: new Date(),
          decidedBy: actorAccountId,
          notes: notes ?? null,
          updatedBy: actorAccountId,
          recordVersion: { increment: 1 },
        },
      });
      await tx.tutorProfile.update({
        where: { id: vcase.tutorId },
        data: {
          verificationStatus: approved ? 'VERIFIED' : 'UNVERIFIED',
          updatedBy: actorAccountId,
        },
      });
      return updatedCase;
    });

    // High-risk, always audited (Roles §13.3, §16.5).
    await this.audit.record({
      actorAccountId,
      action: approved ? 'tutor.verification.approved' : 'tutor.verification.rejected',
      entityType: 'VerificationCase',
      entityReference: caseId,
      authorityContext: { tutorId: vcase.tutorId, decision },
      classification: 'personal',
      correlationId,
    });
    return { id: result.id, status: result.status };
  }

  async revoke(tutorId: string, actorAccountId: string, correlationId?: string) {
    const tutor = await this.prisma.tutorProfile.findFirst({
      where: { id: tutorId, isDeleted: false },
    });
    if (!tutor) throw DomainError.notFound('Tutor profile not found.');

    await this.prisma.$transaction(async (tx) => {
      await tx.tutorProfile.update({
        where: { id: tutorId },
        data: { verificationStatus: 'REVOKED', updatedBy: actorAccountId },
      });
      // Revoking eligibility must also remove active discoverability (BR-002).
      await tx.tutorOffering.updateMany({
        where: { tutorId, status: 'ACTIVE' },
        data: { status: 'INACTIVE', updatedBy: actorAccountId },
      });
    });

    await this.audit.record({
      actorAccountId,
      action: 'tutor.verification.revoked',
      entityType: 'TutorProfile',
      entityReference: tutorId,
      classification: 'personal',
      correlationId,
    });
    return { tutorId, verificationStatus: 'REVOKED' };
  }
}
