'use client';

import { useEffect, useState } from 'react';
import { getAccessToken, getEmail, decodeClaims, logout, type TokenClaims } from './auth';

/** Role groups used for routing/nav decisions on the client. */
export const OPERATIONAL_ROLES = ['super_admin', 'admin', 'moderator', 'finance', 'support'];

export interface Session {
  loading: boolean;
  authenticated: boolean;
  email: string | null;
  claims: TokenClaims | null;
  roles: string[];
  permissions: string[];
  hasRole: (role: string) => boolean;
  hasPermission: (key: string) => boolean;
  isAdmin: boolean;
  isOperational: boolean;
  primaryRole: string | null;
  signOut: () => void;
}

/** Read the current browser session (token claims). Client-only. */
export function useSession(): Session {
  const [state, setState] = useState<{ claims: TokenClaims | null; email: string | null; loading: boolean }>({
    claims: null,
    email: null,
    loading: true,
  });

  useEffect(() => {
    const token = getAccessToken();
    setState({ claims: token ? decodeClaims(token) : null, email: getEmail(), loading: false });
  }, []);

  const roles = state.claims?.roles ?? [];
  const permissions = state.claims?.permissions ?? [];

  return {
    loading: state.loading,
    authenticated: !!state.claims,
    email: state.email,
    claims: state.claims,
    roles,
    permissions,
    hasRole: (r) => roles.includes(r),
    hasPermission: (k) => permissions.includes(k),
    isAdmin: roles.includes('super_admin') || roles.includes('admin'),
    isOperational: roles.some((r) => OPERATIONAL_ROLES.includes(r)),
    primaryRole: roles[0] ?? null,
    signOut: () => logout(),
  };
}

/** Where a given role should land after login. */
export function homePathForRoles(lang: string, roles: string[]): string {
  if (roles.some((r) => OPERATIONAL_ROLES.includes(r))) return `/${lang}/admin`;
  if (roles.includes('tutor')) return `/${lang}/tutor`;
  if (roles.includes('parent')) return `/${lang}/parent`;
  if (roles.includes('student')) return `/${lang}/student`;
  return `/${lang}/student`;
}