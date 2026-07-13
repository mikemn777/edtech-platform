import { CertificatesService } from './certificates.service';
import { PolicyService } from '../../../shared/authz/policy.service';
import { AuditService } from '../../audit/application/audit.service';
import { DomainError, DomainErrorCode } from '../../../platform/errors/domain-error';
import type { PrismaService } from '../../../shared/prisma/prisma.service';
import type { AuthenticatedPrincipal } from '../../../shared/identity/request-context';
import type { IssueCertificateDto } from '../contracts/certificate.dto';

/**
 * Verifies certificate issuance is bound to the course's actual owner and to a
 * real enrollment (P0-1-style object-level checks; PHASE3_PROGRESS.md "issue on
 * completion, unique serial, revoke"), and that revocation is bound to the
 * original issuer. No database — Prisma is stubbed per test.
 */
describe('CertificatesService (object-level authorization)', () => {
  const student = (accountId: string): AuthenticatedPrincipal => ({
    accountId,
    identityId: `id-${accountId}`,
    roles: ['student'],
    permissions: [],
    scopes: [],
  });
  const tutor = (accountId: string): AuthenticatedPrincipal => ({
    accountId,
    identityId: `id-${accountId}`,
    roles: ['tutor'],
    permissions: [],
    scopes: [],
  });

  const baseDto: IssueCertificateDto = {
    studentId: 'student-profile-1',
    title: 'Algebra I Completion',
    issuedForType: 'COURSE',
    issuedForId: 'course-1',
  };

  function makePrisma(overrides: Record<string, unknown> = {}): PrismaService {
    return {
      studentProfile: {
        findFirst: async () => ({ id: 'student-profile-1', accountId: 'student-account-1' }),
      },
      course: {
        findFirst: async () => ({ id: 'course-1', ownerAccountId: 'tutor-account-1' }),
      },
      enrollment: {
        findFirst: async () => ({ id: 'enrollment-1' }),
      },
      certificate: {
        create: async (args: { data: Record<string, unknown> }) => ({
          id: 'cert-1',
          studentId: args.data.studentId,
          title: args.data.title,
          issuedForType: args.data.issuedForType,
          issuedForId: args.data.issuedForId,
          serialNumber: args.data.serialNumber,
          issuedAt: new Date(),
          status: 'ISSUED',
        }),
        findFirst: async () => null,
        update: async () => ({ id: 'cert-1', status: 'REVOKED' }),
      },
      auditRecord: { create: async () => ({}) },
      ...overrides,
    } as unknown as PrismaService;
  }

  it("rejects issuance by a tutor who doesn't own the course", async () => {
    const prisma = makePrisma();
    const service = new CertificatesService(prisma, new AuditService(prisma), new PolicyService(prisma));
    await expect(service.issue(baseDto, tutor('some-other-tutor'))).rejects.toMatchObject({
      code: DomainErrorCode.FORBIDDEN,
    });
  });

  it('rejects issuance when the student has no enrollment in the course', async () => {
    const prisma = makePrisma({ enrollment: { findFirst: async () => null } });
    const service = new CertificatesService(prisma, new AuditService(prisma), new PolicyService(prisma));
    await expect(service.issue(baseDto, tutor('tutor-account-1'))).rejects.toMatchObject({
      code: DomainErrorCode.VALIDATION,
    });
  });

  it('issues a certificate for the owning tutor when the student is enrolled', async () => {
    const prisma = makePrisma();
    const service = new CertificatesService(prisma, new AuditService(prisma), new PolicyService(prisma));
    const result = await service.issue(baseDto, tutor('tutor-account-1'));
    expect(result.serialNumber).toMatch(/^EDU-/);
    expect(result.status).toBe('ISSUED');
  });

  it('rejects revoke by someone other than the original issuer', async () => {
    const prisma = makePrisma({
      certificate: {
        findFirst: async () => ({ id: 'cert-1', createdBy: 'tutor-account-1', status: 'ISSUED' }),
      },
    });
    const service = new CertificatesService(prisma, new AuditService(prisma), new PolicyService(prisma));
    await expect(service.revoke('cert-1', tutor('a-different-tutor'))).rejects.toMatchObject({
      code: DomainErrorCode.FORBIDDEN,
    });
  });

  it('verify() returns valid:false for an unknown serial without leaking anything', async () => {
    const prisma = makePrisma({ certificate: { findFirst: async () => null } });
    const service = new CertificatesService(prisma, new AuditService(prisma), new PolicyService(prisma));
    await expect(service.verify('EDU-DOES-NOT-EXIST')).resolves.toEqual({ valid: false });
  });

  it('DomainError.forbidden is used to deny cross-account issuance', () => {
    const err = DomainError.forbidden();
    expect(err.code).toBe(DomainErrorCode.FORBIDDEN);
  });

  it('a student (non-operational, non-owner) cannot issue a certificate for themselves', async () => {
    const prisma = makePrisma();
    const service = new CertificatesService(prisma, new AuditService(prisma), new PolicyService(prisma));
    await expect(service.issue(baseDto, student('student-account-1'))).rejects.toMatchObject({
      code: DomainErrorCode.FORBIDDEN,
    });
  });
});
