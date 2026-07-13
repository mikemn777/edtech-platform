import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AuditService } from '../../audit/application/audit.service';
import { PolicyService } from '../../../shared/authz/policy.service';
import { DomainError } from '../../../platform/errors/domain-error';
import type { AuthenticatedPrincipal } from '../../../shared/identity/request-context';
import type { IssuableTypeDto, IssueCertificateDto } from '../contracts/certificate.dto';

/**
 * Certificates service (Business Domain Model §12). Issuance is manual, by
 * the tutor who owns the completed course/program/path (or staff), and only
 * once the student has a real enrollment in it — a structural integrity
 * check, not a business/legal validity rule (those remain PBD).
 */
@Injectable()
export class CertificatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly policy: PolicyService,
  ) {}

  async issue(dto: IssueCertificateDto, principal: AuthenticatedPrincipal, correlationId?: string) {
    const actorAccountId = principal.accountId;
    const student = await this.prisma.studentProfile.findFirst({
      where: { id: dto.studentId, isDeleted: false },
    });
    if (!student) throw DomainError.notFound('Student profile not found.');

    const ownerAccountId = await this.resolveEnrollableOwner(dto.issuedForType, dto.issuedForId);
    if (!ownerAccountId) throw DomainError.notFound(`${dto.issuedForType.toLowerCase()} not found.`);
    // Only the tutor who owns the course/program/path (or staff) may certify
    // completion of it — mirrors the self-scope used for content management
    // elsewhere (curriculum.service.ts publishCourse et al.).
    this.policy.assertIsSelfOrOperational(principal, ownerAccountId);

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        studentId: dto.studentId,
        enrollableType: dto.issuedForType,
        enrollableId: dto.issuedForId,
        isDeleted: false,
      },
    });
    if (!enrollment) {
      throw DomainError.validation('Student has no enrollment in the given course/program/path.');
    }

    const serialNumber = `EDU-${randomUUID().toUpperCase()}`;
    const certificate = await this.prisma.certificate.create({
      data: {
        studentId: dto.studentId,
        title: dto.title,
        issuedForType: dto.issuedForType,
        issuedForId: dto.issuedForId,
        serialNumber,
        createdBy: actorAccountId,
      },
    });
    await this.audit.record({
      actorAccountId,
      action: 'certificate.issued',
      entityType: 'Certificate',
      entityReference: certificate.id,
      classification: 'minor_related',
      correlationId,
    });
    return this.toView(certificate);
  }

  async listForStudent(studentId: string, principal: AuthenticatedPrincipal) {
    if (!(await this.policy.canActOnStudentProfile(principal, studentId))) throw DomainError.forbidden();
    const rows = await this.prisma.certificate.findMany({
      where: { studentId, isDeleted: false },
      orderBy: { issuedAt: 'desc' },
    });
    return rows.map((r) => this.toView(r));
  }

  async revoke(id: string, principal: AuthenticatedPrincipal, correlationId?: string) {
    const certificate = await this.prisma.certificate.findFirst({ where: { id, isDeleted: false } });
    if (!certificate) throw DomainError.notFound('Certificate not found.');
    // Only the original issuer (or staff) may revoke — never an arbitrary
    // CERTIFICATE_ISSUE holder for a certificate they didn't issue.
    this.policy.assertIsSelfOrOperational(principal, certificate.createdBy);
    const updated = await this.prisma.certificate.update({
      where: { id },
      data: { status: 'REVOKED', updatedBy: principal.accountId, recordVersion: { increment: 1 } },
    });
    await this.audit.record({
      actorAccountId: principal.accountId,
      action: 'certificate.revoked',
      entityType: 'Certificate',
      entityReference: id,
      classification: 'minor_related',
      correlationId,
    });
    return this.toView(updated);
  }

  /** Public verification — deliberately minimal: proves authenticity without
   * exposing the student's identity or other personal data. */
  async verify(serialNumber: string) {
    const certificate = await this.prisma.certificate.findFirst({
      where: { serialNumber, isDeleted: false },
    });
    if (!certificate) return { valid: false as const };
    return {
      valid: certificate.status === 'ISSUED',
      title: certificate.title,
      issuedAt: certificate.issuedAt,
      status: certificate.status,
    };
  }

  private async resolveEnrollableOwner(type: IssuableTypeDto, id: string): Promise<string | null> {
    if (type === 'COURSE') {
      const c = await this.prisma.course.findFirst({ where: { id, isDeleted: false } });
      return c?.ownerAccountId ?? null;
    }
    if (type === 'PROGRAM') {
      const p = await this.prisma.program.findFirst({ where: { id, isDeleted: false } });
      return p?.ownerAccountId ?? null;
    }
    const p = await this.prisma.learningPath.findFirst({ where: { id, isDeleted: false } });
    return p?.ownerAccountId ?? null;
  }

  private toView(c: {
    id: string; studentId: string; title: string; issuedForType: string; issuedForId: string | null;
    serialNumber: string; issuedAt: Date; status: string;
  }) {
    return {
      id: c.id,
      studentId: c.studentId,
      title: c.title,
      issuedForType: c.issuedForType,
      issuedForId: c.issuedForId,
      serialNumber: c.serialNumber,
      issuedAt: c.issuedAt,
      status: c.status,
    };
  }
}
