'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { studentNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { ensureStudentProfileId } from '@/lib/booking';
import { listStudentAssignments, submitAssignment, type Assignment } from '@/lib/homework';
import { Book, Check } from '@/components/icons';

function StatusBadge({ status, t }: { status: string; t: (k: string) => string }) {
  const cls = status === 'GRADED' ? 'badge-ok' : status === 'SUBMITTED' ? 'badge-neutral' : 'badge-warn';
  return <span className={`badge ${cls}`}>{t(`hw.status.${status}`)}</span>;
}

export default function StudentHomework({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const session = useSession();
  const [rows, setRows] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function reload() {
    const sid = await ensureStudentProfileId();
    const list = await listStudentAssignments(sid).catch(() => [] as Assignment[]);
    setRows(list);
  }

  useEffect(() => {
    if (session.loading || !session.authenticated) return;
    reload().finally(() => setLoading(false));
  }, [session.loading, session.authenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(id: string) {
    const text = (drafts[id] || '').trim();
    if (!text) return;
    setErr(null); setBusy(id);
    try { await submitAssignment(id, text); setDrafts((d) => ({ ...d, [id]: '' })); await reload(); }
    catch { setErr(t('hw.error')); } finally { setBusy(null); }
  }

  const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString(lang === 'ar' ? 'ar' : lang === 'tr' ? 'tr' : 'en', { day: 'numeric', month: 'short', year: 'numeric' }) : t('hw.noDue');

  return (
    <DashboardShell lang={lang} title={t('hw.s.title')} nav={studentNav(lang, t)} active={`/${lang}/student/homework`}>
      <h1 className="mb-0">{t('hw.s.title')}</h1>
      <p className="muted">{t('hw.s.subtitle')}</p>
      {err && <div className="alert alert-danger mb-2" style={{ maxWidth: 720 }}>{err}</div>}

      {loading ? (
        <div className="text-c muted mt-3"><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</div>
      ) : rows.length === 0 ? (
        <div className="card text-c card-pad-lg mt-2" style={{ maxWidth: 720 }}>
          <div className="brand-mark" style={{ width: 48, height: 48, marginInline: 'auto' }}><Book /></div>
          <h3 className="mt-2">{t('hw.empty.s.t')}</h3>
          <p className="muted mb-0">{t('hw.empty.s.d')}</p>
        </div>
      ) : (
        <div className="stack gap-2 mt-2" style={{ maxWidth: 760 }}>
          {rows.map((a) => {
            const graded = a.submission?.status === 'graded';
            const submitted = a.submission?.status === 'submitted' || graded;
            return (
              <div className="card" key={a.id}>
                <div className="row between wrap gap-2">
                  <div>
                    <strong>{a.title}</strong>
                    <div className="soft small">{t('hw.due')}: {fmt(a.dueAt)}</div>
                  </div>
                  <StatusBadge status={a.status} t={t} />
                </div>
                {a.description && <p className="muted small mt-2 mb-0" style={{ whiteSpace: 'pre-wrap' }}>{a.description}</p>}

                {graded && (
                  <div className="card mt-2" style={{ background: 'var(--surface-2)' }}>
                    <div className="row gap-2" style={{ alignItems: 'baseline' }}>
                      <span className="l muted small">{t('hw.score')}</span>
                      <strong style={{ fontSize: '1.3rem', color: 'var(--primary)' }}>{a.submission?.score}/100</strong>
                    </div>
                    {a.submission?.feedback && <p className="small mt-1 mb-0"><span className="muted">{t('hw.feedback')}: </span>{a.submission.feedback}</p>}
                  </div>
                )}

                {!graded && (
                  <div className="mt-2">
                    <label className="label">{t('hw.answer')}</label>
                    <textarea className="input" rows={3} placeholder={t('hw.answer.ph')}
                      value={drafts[a.id] ?? a.submission?.contentReference ?? ''}
                      onChange={(e) => setDrafts((d) => ({ ...d, [a.id]: e.target.value }))} />
                    <div className="row gap-2 mt-1">
                      <button className="btn btn-primary btn-sm" disabled={busy === a.id} onClick={() => onSubmit(a.id)}>
                        {busy === a.id ? <span className="spinner" /> : (submitted ? t('hw.resubmit') : t('hw.submit'))}
                      </button>
                      {submitted && <span className="badge badge-ok"><Check width={13} height={13} /> {t('hw.submitted')}</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
