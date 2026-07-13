import { Injectable, Optional } from '@nestjs/common';
import { SystemRole } from '@edu/types';
import { PrismaService } from '../prisma/prisma.service';
import { DomainError } from '../../platform/errors/domain-error';
import type { AuthenticatedPrincipal } from '../identity/request-context';
import type { PermissionKey } from '../permission/permission-keys';

const GUARDIAN_OF = 'guardian_of';

/** Roles whose grants are platform-scoped (Roles §3.3, §12.4) — they act on any
 * actor's data by design (operational role family), so object-level checks
 * below bypass for them. Actor roles (student/parent/tutor) never bypass. */
const OPERATIONAL_ROLES: ReadonlySet<string> = new Set([
  SystemRole.SUPER_ADMIN,
  SystemRole.ADMIN,
  SystemRole.MODERATOR,
  SystemRole.SUPPORT,
  SystemRole.FINANCE,
]);

/**
 * Central authorization reasoning (Roles doc §15.8 — reasoned centrally, not
 * per-feature). Deny-by-default, least-privilege, fails closed (§15.3-15.4,
 * §16.8). Combined roles yield the union of explicit permissions (§5.4).
 *
 * Also the single home for OBJECT-LEVEL / self-scope authorization (Roles
 * §3.3, §15.3; P0-1): holding a permission proves the caller MAY perform the
 * action in general, not that they may perform it on a SPECIFIC record. Every
 * actor-scoped route must additionally call one of the `canActOn*` /
 * `assertCanActOn*` methods below with the resource actually being touched.
 */
@Injectable()
export class PolicyService {
  // PrismaService is optional so the unit spec can construct this class
  // without a database (`new PolicyService()`); every object-level method
  // below requires it and is exercised only via Nest DI in real requests.
  constructor(@Optional() private readonly prisma?: PrismaService) {}

  /** True only if the principal explicitly holds ALL required permissions. */
  hasAllPermissions(
    principal: AuthenticatedPrincipal | undefined,
    required: PermissionKey[],
  ): boolean {
    if (!principal) return false; // fail closed
    if (required.length === 0) return true;
    const granted = new Set(principal.permissions);
    return required.every((p) => granted.has(p));
  }

  /**
   * Guardrail for minor-sensitive actions (Roles §16.2; Requirements BR-003).
   * Absent an authoritative permissive rule, resolves to the most restrictive
   * outcome (denied). Real guardianship rules are Pending Business Decision.
   */
  canActOnMinor(_principal: AuthenticatedPrincipal | undefined): boolean {
    // No authoritative rule established yet → deny (most protective).
    return false;
  }

  // ---- Object-level / self-scope authorization (P0-1) ----

  /** True if the principal holds a platform-scoped (operational) role. */
  isOperational(principal: AuthenticatedPrincipal | undefined): boolean {
    if (!principal) return false;
    return principal.roles.some((r) => OPERATIONAL_ROLES.has(r));
  }

  /** True if the principal IS the given account (self-scope). */
  isSelf(principal: AuthenticatedPrincipal | undefined, accountId: string | null | undefined): boolean {
    return !!principal && !!accountId && principal.accountId === accountId;
  }

  /** Self-scope OR operational — the common case for "owns this record or is staff". */
  isSelfOrOperational(
    principal: AuthenticatedPrincipal | undefined,
    ownerAccountId: string | null | undefined,
  ): boolean {
    return this.isOperational(principal) || this.isSelf(principal, ownerAccountId);
  }

  /** Throwing form of {@link isSelfOrOperational}. Fails closed on FORBIDDEN. */
  assertIsSelfOrOperational(
    principal: AuthenticatedPrincipal | undefined,
    ownerAccountId: string | null | undefined,
  ): void {
    if (!this.isSelfOrOperational(principal, ownerAccountId)) throw DomainError.forbidden();
  }

  /**
   * True if the principal holds an ACTIVE guardian_of relationship to the given
   * student account. Guardianship links are created PENDING and confer no
   * oversight until an authoritative consent rule is established (Constitution
   * Art. VI; relationships module) — this only ever resolves true once that
   * governed transition to 'active' exists, so it fails closed today by design.
   */
  async isActiveGuardianOf(
    principal: AuthenticatedPrincipal | undefined,
    studentAccountId: string,
  ): Promise<boolean> {
    if (!principal || !this.prisma) return false;
    const link = await this.prisma.accountRelationship.findFirst({
      where: {
        fromAccountId: principal.accountId,
        toAccountId: studentAccountId,
        relationshipType: GUARDIAN_OF,
        status: 'active',
        isDeleted: false,
      },
      select: { id: true },
    });
    return !!link;
  }

  /**
   * Object-level authorization for a resource owned by a student ACCOUNT
   * (Roles §3.3 self/relationship scope): the caller IS the student, holds an
   * active guardianship over them, or holds an operational role.
   */
  async canActOnStudentAccount(
    principal: AuthenticatedPrincipal | undefined,
    studentAccountId: string,
  ): Promise<boolean> {
    if (this.isSelfOrOperational(principal, studentAccountId)) return true;
    return this.isActiveGuardianOf(principal, studentAccountId);
  }

  /** Resolves a StudentProfile.id to its owning account id (or null if absent). */
  async resolveStudentAccountId(studentProfileId: string): Promise<string | null> {
    if (!this.prisma) return null;
    const student = await this.prisma.studentProfile.findFirst({
      where: { id: studentProfileId, isDeleted: false },
      select: { accountId: true },
    });
    return student?.accountId ?? null;
  }

  /** Same as {@link canActOnStudentAccount} but keyed by StudentProfile.id. */
  async canActOnStudentProfile(
    principal: AuthenticatedPrincipal | undefined,
    studentProfileId: string,
  ): Promise<boolean> {
    const accountId = await this.resolveStudentAccountId(studentProfileId);
    if (!accountId) return false;
    return this.canActOnStudentAccount(principal, accountId);
  }

  /** Throwing form of {@link canActOnStudentProfile}. Fails closed on FORBIDDEN. */
  async assertCanActOnStudentProfile(
    principal: AuthenticatedPrincipal | undefined,
    studentProfileId: string,
  ): Promise<void> {
    if (!(await this.canActOnStudentProfile(principal, studentProfileId))) throw DomainError.forbidden();
  }

  /** Resolves a TutorProfile.id to its owning account id (or null if absent). */
  async resolveTutorAccountId(tutorProfileId: string): Promise<string | null> {
    if (!this.prisma) return null;
    const tutor = await this.prisma.tutorProfile.findFirst({
      where: { id: tutorProfileId, isDeleted: false },
      select: { accountId: true },
    });
    return tutor?.accountId ?? null;
  }

  /** True if the principal IS the tutor behind this TutorProfile.id, or operational. */
  async isSelfTutorOrOperational(
    principal: AuthenticatedPrincipal | undefined,
    tutorProfileId: string,
  ): Promise<boolean> {
    if (this.isOperational(principal)) return true;
    const accountId = await this.resolveTutorAccountId(tutorProfileId);
    return this.isSelf(principal, accountId);
  }
}
