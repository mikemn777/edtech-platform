'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { studentNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { ensureStudentProfileId } from '@/lib/booking';
import { listGoals, createGoal, setGoalStatus, type Goal } from '@/lib/goals';
import { Check, Chart } from '@/components/icons';

function statusClass(s: string): string {
  if (s === 'ACHIEVED') return 'badge-ok';
  if (s === 'ABANDONED') return 'badge-danger';
  return 'badge-warn';
}

export default function StudentGoals({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);

  const [studentId, setStudentId] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const id = await ensureStudentProfileId();
        setStudentId(id);
        setGoals(await listGoals(id).catch(() => []));
      } catch { setErr(t('goals.error')); } finally { setLoading(false); }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function add() {
    if (!studentId || !title.trim()) return;
    setBusy(true); setErr(null);
    try {
      await createGoal(studentId, { title: title.trim(), description: description.trim() || undefined, targetDate: targetDate || undefined });
      setTitle(''); setDescription(''); setTargetDate('');
      setGoals(await listGoals(studentId));
    } catch { setErr(t('goals.error')); } finally { setBusy(false); }
  }

  async function mark(goalId: string, status: 'ACHIEVED' | 'ABANDONED') {
    if (!studentId) return;
    setGoals((prev) => prev.map((g) => g.id === goalId ? { ...g, status } : g));
    await setGoalStatus(studentId, goalId, status).catch(() => {});
  }

  return (
    <DashboardShell lang={lang} title={t('goals.title')} nav={studentNav(lang, t)} active={`/${lang}/student/goals`}>
      <h1 className="mb-0">{t('goals.title')}</h1>
      <p className="muted">{t('goals.subtitle')}</p>

      <div className="card mt-2" style={{ maxWidth: 640 }}>
        <h3>{t('goals.add')}</h3>
        {err && <div className="alert alert-danger mb-2">{err}</div>}
        <div className="field">
          <label className="label">{t('goals.goalTitle')}</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('goals.title.ph')} />
        </div>
        <div className="field">
          <label className="label">{t('goals.desc')}</label>
          <textarea className="textarea" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('goals.desc.ph')} />
        </div>
        <div className="row gap-2 wrap" style={{ alignItems: 'flex-end' }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="label">{t('goals.target')}</label>
            <input className="input" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={add} disabled={busy || !title.trim()}>{busy ? <span className="spinner" /> : t('goals.addBtn')}</button>
        </div>
      </div>

      <h3 className="mt-4">{t('goals.yours')}</h3>
      {loading ? (
        <div className="text-c muted mt-2"><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</div>
      ) : goals.length === 0 ? (
        <div className="card text-c card-pad-lg mt-2">
          <div className="brand-mark" style={{ width: 48, height: 48, marginInline: 'auto' }}><Chart /></div>
          <h3 className="mt-2">{t('goals.empty.t')}</h3>
          <p className="muted mb-0">{t('goals.empty.d')}</p>
        </div>
      ) : (
        <div className="stack gap-2 mt-2" style={{ maxWidth: 720 }}>
          {goals.map((g) => (
            <div className="card" key={g.id}>
              <div className="row between wrap gap-2">
                <div>
                  <strong>{g.title}</strong>
                  {g.description && <p className="muted small mt-1 mb-0">{g.description}</p>}
                  {g.targetDate && <div className="soft small mt-1">{t('goals.by')} {new Date(g.targetDate).toLocaleDateString(lang === 'ar' ? 'ar' : 'en')}</div>}
                </div>
                <div className="row gap-2">
                  <span className={`badge ${statusClass(g.status)}`}>{t(`goals.status.${g.status}`)}</span>
                  {g.status === 'ACTIVE' && (
                    <>
                      <button className="btn btn-outline btn-sm" onClick={() => mark(g.id, 'ACHIEVED')}><Check width={14} height={14} /> {t('goals.done')}</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => mark(g.id, 'ABANDONED')}>{t('goals.drop')}</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
