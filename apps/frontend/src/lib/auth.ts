import { apiFetch } from './api-client';

/**
 * Client-side session helpers (Blueprint §3). The frontend holds NO business
 * rules and NO secrets beyond the short-lived tokens the backend issues; every
 * authorization decision is still enforced server-side. Tokens live in the
 * browser only. This is a first, minimal auth surface — refresh rotation and
 * secure cookie storage are natural follow-ups.
 */

const TOKEN_KEY = 'edu.accessToken';
const REFRESH_KEY = 'edu.refreshToken';
const EMAIL_KEY = 'edu.email';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
}

/** The claims the backend puts inside the access token (auth.service issue()). */
export interface TokenClaims {
  sub: string;
  identityId: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

/** Authenticate against the backend and persist the session in the browser. */
export async function login(email: string, password: string): Promise<void> {
  const tokens = await apiFetch<AuthTokens>('auth/login', {
    method: 'POST',
    body: { email, password },
  });
  saveSession(tokens, email);
}

/** Register a new account, then sign in so the session is ready. */
export async function register(email: string, password: string, displayName: string): Promise<void> {
  await apiFetch<{ accountId: string }>('auth/register', {
    method: 'POST',
    body: { email, password, displayName },
  });
  await login(email, password);
}

export function saveSession(tokens: AuthTokens, email: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_KEY, tokens.accessToken);
  window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  window.localStorage.setItem(EMAIL_KEY, email);
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(EMAIL_KEY);
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(EMAIL_KEY);
}

/** Decode a JWT's payload (no verification — display only; the server verifies). */
export function decodeClaims(token: string): TokenClaims | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as TokenClaims;
  } catch {
    return null;
  }
}