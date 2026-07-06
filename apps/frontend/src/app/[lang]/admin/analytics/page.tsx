'use client';

import DashboardShell from '@/components/DashboardShell';
import { adminNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { useApiQuery } from '@/lib/useApi';
import type { PaginatedResult } from '@edu/types';

export default function AdminAnalytics({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const users = useApiQuery<PaginatedResult<unknown>>('users?page=1&pageSize=1');
  const tutors = useApiQuery<PaginatedResult<unknown>>('marketplace/tutors?page=1&pageSize=1');
  const courses = useApiQuery<{ id: string }[]>('curriculum/courses');
  const queue = useApiQuery<{ verificationStatus: string }[]>('tutor-verification/queue');

  const pending = (queue.data ?? []).filter((q) => q.verificationStatus === 'PENDING' || q.verificationStatus === 'UNVERIFIED').length;
  const tiles = [
    { n: users.data?.meta.total, l: t('ana.accounts') },
    { n: tutors.data?.meta.total, l: t('ana.tutors') },
    { n: courses.data?.length, l: t('ana.courses') },
    { n: queue.data ? pending : undefined, l: t('ana.pending') },
  ];

  return (
    <DashboardShell lang={lang} title={t('nav.analytics')} nav={adminNav(lang, t)} active={`/${lang}/admin/analytics`}>
      <h1 className="mb-0">{t('nav.analytics')}</h1>
      <p className="muted">{t('ana.subtitle')}</p>
      <div className="grid cols-4 mt-2">
        {tiles.map((x) => (
          <div className="card" key={x.l}><div className="stat"><span className="n">{x.n ?? '—'}</span><span className="l">{x.l}</span></div></div>
        ))}
      </div>
      <p className="soft small mt-3">{t('ana.note')}</p>
    </DashboardShell>
  );
}
