'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { tutorNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { listAuthoredAssignments, createAssignment, gradeAssignment, type Assignment } from '@/lib/homework';
import { Book, Check } from '@/components/icons';

export default function TutorHomework({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const session = useSession();

  const [rows, setRows] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // create form
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [due, setDue] = useState('');
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  // grading
  const [grades, setGrades] = useState<Record<string, { score: string; feedback: string }>>({});
  const [gradingId, setGradingId] = useState<string | null>(null);

  async function reload() {
    const list = await listAuthoredAssignments().catch(() => [] as Assignment[]);
    setRows(list);
  }
  useEffect(() => {
    if (session.loading || !session.authenticated) return;
    reload().finally(() => setLoading(false));
  }, [session.loading, session.authenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onCreate() {
    if (!title.trim() || !studentCode.trim()) return;
    setErr(null); setCreating(true); setCreated(false);
    try {
      await createAssignment({ title: title.trim(), description: desc.trim() || undefined, studentAccountId: studentCode.trim(), dueAt: due ? new Date(due).toISOString() : undefined });
      setTitle(''); setDesc(''); setStudentCode(''); setDue(''); setCreated(true);
      await reload();
    } catch { setErr(t('hw.error')); } finally { setCreating(false); }
  }

  async function onGrade(id: string) {
    const g = grades[id];
    if (!g || g.score === '') return;
    const score = Number(g.score);
    if (Number.isNaN(score) || score < 0 || score > 100) { setErr(t('hw.score.range')); return; }
    setErr(null); setGradingId(id);
    try { await gradeAssignment(id, score, g.feedback || undefined); await reload(); }
    catch { setErr(t('hw.error')); } finally { setGradingId(null); }
  }

  const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString(lang === 'ar' ? 'ar' : lang === 'tr' ? 'tr' : 'en', { day: 'numeric', month: 'short' }) : t('hw.noDue');

  return (
    <DashboardShell lang={lang} title={t('hw.t.title')} nav={tutorNav(lang, t)} active={`/${lang}/tutor/homework`}>
      <h1 className="mb-0">{t('hw.t.title')}</h1>
      <p className="muted">{t('hw.t.subtitle')}</p>
      {err && <div className="alert alert-danger mb-2" style={{ maxWidth: 720 }}>{err}</div>}

      {/* Create */}
      <div className="card mt-2" style={{ maxWidth: 720 }}>
        <h3>{t('hw.create')}</h3>
        <div className="field"><label className="label">{t('hw.f.title')}</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="field"><label className="label">{t('hw.f.desc')}</label>
          <textarea className="input" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
        <div className="row gap-2 wrap">
          <div className="field" style={{ flex: 1, minWidth: 240 }}><label className="label">{t('hw.f.student')}</label>
            <input className="input mono" value={studentCode} onChange={(e) => setStudentCode(e.target.value)} placeholder="xxxxxxxx-xxxx-…" />
            <div className="hint">{t('hw.f.studentHint')}</div></div>
          <div className="field" style={{ minWidth: 180 }}><label className="label">{t('hw.f.due')}</label>
            <input className="input" type="date" value={due} onChange={(e) => setDue(e.target.value)} /></div>
        </div>
        <div className="row gap-2">
          <button className="btn btn-primary" disabled={creating || !title.trim() || !studentCode.trim()} onClick={onCreate}>
            {creating ? <span className="spinner" /> : t('hw.assignBtn')}</button>
          {created && <span className="badge badge-ok"><Check width={13} height={13} /> {t('hw.assigned')}</span>}
        </div>
      </div>

      {/* Authored list */}
      <h3 className="mt-4">{t('hw.list.t')} ({rows.length})</h3>
      {loading ? (
        <div className="text-c muted mt-2"><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</div>
      ) : rows.length === 0 ? (
        <div className="card text-c card-pad-lg mt-2" style={{ maxWidth: 720 }}>
          <div className="brand-mark" style={{ width: 48, height: 48, marginInline: 'auto' }}><Book /></div>
          <p className="muted mb-0 mt-2">{t('hw.empty.t.d')}</p>
        </div>
      ) : (
        <div className="stack gap-2 mt-2" style={{ maxWidth: 760 }}>
          {rows.map((a) => {
            const graded = a.submission?.status === 'graded';
            const submitted = a.submission?.status === 'submitted';
            const g = grades[a.id] ?? { score: a.submission?.score != null ? String(a.submission.score) : '', feedback: a.submission?.feedback ?? '' };
            return (
              <div className="card" key={a.id}>
                <div className="row between wrap gap-2">
                  <div>
                    <strong>{a.title}</strong>
                    <div className="soft small">{t('hw.forStudent')}: <span className="mono">{a.studentId.slice(0, 8)}…</span> · {t('hw.due')}: {fmt(a.dueAt)}</div>
                  </div>
                  <span className={`badge ${graded ? 'badge-ok' : submitted ? 'badge-neutral' : 'badge-warn'}`}>
                    {graded ? t('hw.graded') : submitted ? t('hw.status.SUBMITTED') : t('hw.waiting')}
                  </span>
                </div>

                {(submitted || graded) && a.submission?.contentReference && (
                  <div className="card mt-2" style={{ background: 'var(--surface-2)' }}>
                    <span className="muted small">{t('hw.view')}:</span>
                    <p className="small mt-1 mb-0" style={{ whiteSpace: 'pre-wrap' }}>{a.submission.contentReference}</p>
                  </div>
                )}

                {submitted && !graded && (
                  <div className="mt-2">
                    <div className="row gap-2 wrap" style={{ alignItems: 'flex-end' }}>
                      <div className="field" style={{ width: 130 }}><label className="label">{t('hw.score')} (0–100)</label>
                        <input className="input" type="number" min={0} max={100} value={g.score}
                          onChange={(e) => setGrades((s) => ({ ...s, [a.id]: { ...g, score: e.target.value } }))} /></div>
                      <div className="field" style={{ flex: 1, minWidth: 220 }}><label className="label">{t('hw.feedback')}</label>
                        <input className="input" value={g.feedback}
                          onChange={(e) => setGrades((s) => ({ ...s, [a.id]: { ...g, feedback: e.target.value } }))} /></div>
                    </div>
                    <button className="btn btn-primary btn-sm mt-1" disabled={gradingId === a.id || g.score === ''} onClick={() => onGrade(a.id)}>
                      {gradingId === a.id ? <span className="spinner" /> : t('hw.gradeBtn')}</button>
                  </div>
                )}

                {graded && (
                  <p className="small mt-2 mb-0"><span className="muted">{t('hw.score')}: </span><strong style={{ color: 'var(--primary)' }}>{a.submission?.score}/100</strong>
                    {a.submission?.feedback ? <> · <span className="muted">{t('hw.feedback')}: </span>{a.submission.feedback}</> : null}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
