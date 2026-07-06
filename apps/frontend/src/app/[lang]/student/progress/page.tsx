'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { studentNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { ensureStudentProfileId } from '@/lib/booking';
import { listGoals, type Goal } from '@/lib/goals';
import { listEnrollments, type EnrollmentRow } from '@/lib/courses';
import { authed } from '@/lib/useApi';
import { Chart, Check, Book, Calendar } from '@/components/icons';

interface ProgressRow { id: string; metricKey: string; value: number | null; note: string | null; recordedAt: string }

export default function StudentProgress({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);

  const [goals, setGoals] = useState<Goal[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [records, setRecords] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const sid = await ensureStudentProfileId();
        const [g, e, r] = await Promise.all([
          listGoals(sid).catch(() => [] as Goal[]),
          listEnrollments(sid).catch(() => [] as EnrollmentRow[]),
          authed<ProgressRow[]>(`students/${sid}/progress`).catch(() => [] as ProgressRow[]),
        ]);
        setGoals(g); setEnrollments(e); setRecords(r);
      } finally { setLoading(false); }
    })();
  }, []);

  const achieved = goals.filter((g) => g.status === 'ACHIEVED').length;
  const activeGoals = goals.filter((g) => g.status === 'ACTIVE').length;
  const activeCourses = enrollments.filter((e) => e.status === 'ACTIVE').length;

  return (
    <DashboardShell lang={lang} title={t('progress.title')} nav={studentNav(lang, t)} active={`/${lang}/student/progress`}>
      <h1 className="mb-0">{t('progress.title')}</h1>
      <p className="muted">{t('progress.subtitle')}</p>

      {loading ? (
        <div className="text-c muted mt-3"><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</div>
      ) : (
        <>
          <div className="grid cols-3 mt-2">
            <div className="card"><div className="stat"><span className="n">{achieved}</span><span className="l">{t('progress.stat.achieved')}</span></div></div>
            <div className="card"><div className="stat"><span className="n">{activeGoals}</span><span className="l">{t('progress.stat.activeGoals')}</span></div></div>
            <div className="card"><div className="stat"><span className="n">{activeCourses}</span><span className="l">{t('progress.stat.courses')}</span></div></div>
          </div>

          <h3 className="mt-4">{t('progress.timeline')}</h3>
          {goals.length === 0 && records.length === 0 ? (
            <div className="card text-c card-pad-lg mt-2">
              <div className="brand-mark" style={{ width: 48, height: 48, marginInline: 'auto' }}><Chart /></div>
              <h3 className="mt-2">{t('progress.empty.t')}</h3>
              <p className="muted mb-0">{t('progress.empty.d')}</p>
            </div>
          ) : (
            <div className="stack gap-2 mt-2" style={{ maxWidth: 720 }}>
              {goals.filter((g) => g.status !== 'ABANDONED').map((g) => (
                <div className="card row between wrap gap-2" key={g.id} style={{ padding: '.9rem 1.2rem' }}>
                  <span className="row gap-2">
                    <span className="brand-mark" style={{ width: 34, height: 34, background: g.status === 'ACHIEVED' ? 'var(--ok-500)' : undefined }}>
                      {g.status === 'ACHIEVED' ? <Check width={16} height={16} /> : <Chart width={16} height={16} />}
                    </span>
                    <span><strong>{g.title}</strong>{g.targetDate && <span className="soft small" style={{ display: 'block' }}><Calendar width={12} height={12} /> {new Date(g.targetDate).toLocaleDateString(lang === 'ar' ? 'ar' : 'en')}</span>}</span>
                  </span>
                  <span className={`badge ${g.status === 'ACHIEVED' ? 'badge-ok' : 'badge-warn'}`}>{t(`goals.status.${g.status}`)}</span>
                </div>
              ))}
              {records.map((r) => (
                <div className="card row between wrap gap-2" key={r.id} style={{ padding: '.9rem 1.2rem' }}>
                  <span className="row gap-2">
                    <span className="brand-mark" style={{ width: 34, height: 34 }}><Book width={16} height={16} /></span>
                    <span><strong style={{ textTransform: 'capitalize' }}>{r.metricKey.replace(/_/g, ' ')}</strong>{r.note && <span className="muted small" style={{ display: 'block' }}>{r.note}</span>}</span>
                  </span>
                  <span className="soft small">{new Date(r.recordedAt).toLocaleDateString(lang === 'ar' ? 'ar' : 'en')}{r.value !== null && <strong style={{ marginInlineStart: 8 }}>{r.value}</strong>}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}
