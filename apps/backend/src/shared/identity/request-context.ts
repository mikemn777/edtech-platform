/**
 * Authenticated request context — the trustworthy identity + authority assertion
 * consumed across the app (System Architecture §11-12; Roles doc). Attached to the
 * request after authentication; authorization reasons over it centrally.
 */
import type { PermissionScope } from '@edu/types';

export interface AuthenticatedPrincipal {
  accountId: string;
  identityId: string;
  roles: string[];
  /** Flattened set of permission keys granted via the principal's roles. */
  permissions: string[];
  scopes: Array<{ type: PermissionScope; reference?: string }>;
  primaryJurisdictionId?: string;
  primaryLocaleId?: string;
}

export interface RequestContext {
  correlationId: string;
  /** Resolved language for i18n of responses/errors (Constitution Art. III). */
  language: string;
  principal?: AuthenticatedPrincipal;
}
