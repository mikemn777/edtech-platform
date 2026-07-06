import { Injectable } from '@nestjs/common';
import type { AuthenticatedPrincipal } from '../identity/request-context';
import type { PermissionKey } from '../permission/permission-keys';

/**
 * Central authorization reasoning (Roles doc §15.8 — reasoned centrally, not
 * per-feature). Deny-by-default, least-privilege, fails closed (§15.3-15.4,
 * §16.8). Combined roles yield the union of explicit permissions (§5.4).
 */
@Injectable()
export class PolicyService {
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
}
