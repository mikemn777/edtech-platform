import type { ApiErrorBody } from '@edu/types';

/**
 * Backend API client (Blueprint §3.1, §3.4, §3.6). The frontend consumes
 * contracts only; it holds no business rules and no secrets. The base URL comes
 * from configuration (never hardcoded — Art. IX/X). Authorization tokens are
 * passed through; authorization itself is always enforced server-side.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? 'v1';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  language?: string;
  accessToken?: string;
  signal?: AbortSignal;
}

/** Build a full URL for a versioned API path — for callers that need the raw
 * fetch (e.g. binary/blob downloads) instead of the JSON-only apiFetch. */
export function buildApiUrl(path: string): string {
  return `${API_BASE_URL}/${API_VERSION}/${path}`;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiErrorBody,
  ) {
    super(body.error?.message ?? 'Request failed');
    this.name = 'ApiError';
  }
}

/**
 * Perform a typed request against a versioned API path (e.g. 'auth/login').
 * Uniform error handling mirrors the backend envelope (Blueprint §1.5, §13).
 */
export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, language, accessToken, signal } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (language) headers['x-language'] = language;
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const response = await fetch(`${API_BASE_URL}/${API_VERSION}/${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
    cache: 'no-store',
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : undefined;

  if (!response.ok) {
    throw new ApiError(response.status, payload as ApiErrorBody);
  }
  return payload as T;
}
