'use client';

import { useEffect, useState } from 'react';
import { apiFetch, ApiError, type ApiRequestOptions } from './api-client';
import { getAccessToken } from './auth';

/** Fetch an authenticated endpoint (attaches the stored bearer token). */
export function authed<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  return apiFetch<T>(path, { ...options, accessToken: getAccessToken() ?? undefined });
}

function messageOf(e: unknown): string {
  if (e instanceof ApiError) return e.body?.error?.message ?? 'Request failed.';
  return 'Could not reach the server.';
}

/** Minimal data-fetching hook for authenticated GETs. Pass null to skip. */
export function useApiQuery<T>(path: string | null, deps: unknown[] = []): {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    if (!path) { setLoading(false); return; }
    setLoading(true);
    authed<T>(path)
      .then((d) => { if (alive) { setData(d); setError(null); } })
      .catch((e) => { if (alive) setError(messageOf(e)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, tick, ...deps]);

  return { data, error, loading, reload: () => setTick((t) => t + 1) };
}