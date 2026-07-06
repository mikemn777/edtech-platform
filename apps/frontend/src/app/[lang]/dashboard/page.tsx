'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, decodeClaims } from '@/lib/auth';
import { homePathForRoles } from '@/lib/session';

/** Legacy entry point — routes the user to their role-specific dashboard. */
export default function DashboardRedirect({ params }: { params: { lang: string } }) {
  const router = useRouter();
  useEffect(() => {
    const token = getAccessToken();
    if (!token) { router.replace(`/${params.lang}/login`); return; }
    const roles = decodeClaims(token)?.roles ?? [];
    router.replace(homePathForRoles(params.lang, roles));
  }, [params.lang, router]);

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <span className="spinner" style={{ width: 26, height: 26, color: 'var(--primary)' }} />
    </div>
  );
}