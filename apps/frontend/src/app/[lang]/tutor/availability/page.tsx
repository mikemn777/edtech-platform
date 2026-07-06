'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { tutorNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { getMyTutorProfile, listAvailability, addAvailability, cancelAvailability, type AvailabilityRow } from '@/lib/tutorSelf';
import { Calendar } from '@/components/icons';

export default function TutorAvailability({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);

  const [tutorId, setTutorId] = useState<string | null>(null);
  const [rows, setRows] = useState<AvailabilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('16:00');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const p = await getMyTutorProfile();
        if (p) { setTutorId(p.id); setRows((await listAvailability(p.id).catch(() => [])).filter((r) => r.status === 'ACTIVE')); }
      } finally { setLoading(false); }
    })();
  }, []);

  async function add() {
    if (!tutorId || !date || !time) return;
    setErr(null); setBusy(true);
    try {
      const start = new Date(`${date}T${time}`);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      await addAvailability(tutorId, start.toISOString(), end.toISOString());
      setRows((await listAvailability(tutorId)).filter((r) => r.status === 'ACTIVE'));
    } catch { setErr(t('avail.error')); } finally { setBusy(false); }
  }

  async function cancel(id: string) {
    if (!tutorId) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    await cancelAvailability(tutorId, id).catch(() => {});
  }

  const upcoming = rows
    .filter((r) => new Date(r.startAt) > new Date())
    .sort((a, b) => a.startAt.localeCompare(b.startAt));

  return (
    <DashboardShell lang={lang} title={t('avail.title')} nav={tutorNav(lang, t)} active={`/${lang}/tutor/availability`}>
      <h1 className="mb-0">{t('avail.title')}</h1>
      <p className="muted">{t('avail.subtitle')}</p>

      {loading ? (
        <div className="text-c muted mt-3"><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</div>
      ) : !tutorId ? (
        <div className="card mt-3">
          <p className="muted mb-2">{t('avail.needProfile')}</p>
          <a href={`/${lang}/tutor/profile`} className="btn btn-primary">{t('tutorEdit.title')}</a>
        </div>
      ) : (
        <>
          <div className="card mt-3" style={{ maxWidth: 560 }}>
            <h3>{t('avail.add')}</h3>
            {err && <div className="alert alert-danger mb-2">{err}</div>}
            <div className="row gap-2 wrap" style={{ alignItems: 'flex-end' }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="label">{t('avail.date')}</label>
                <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="label">{t('avail.time')}</label>
                <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={add} disabled={busy || !date}>{busy ? <span className="spinner" /> : t('avail.addBtn')}</button>
            </div>
            <p className="hint">{t('avail.hint')}</p>
          </div>

          <h3 className="mt-4">{t('avail.upcoming')} ({upcoming.length})</h3>
          {upcoming.length === 0 ? (
            <p className="muted">{t('avail.none')}</p>
          ) : (
            <div className="stack gap-1 mt-2" style={{ maxWidth: 560 }}>
              {upcoming.map((r) => {
                const d = new Date(r.startAt);
                const label = d.toLocaleString(lang === 'ar' ? 'ar' : lang === 'tr' ? 'tr' : 'en', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={r.id} className="card row between" style={{ padding: '.6rem .9rem' }}>
                    <span className="small"><Calendar width={14} height={14} /> {label}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => cancel(r.id)}>{t('bookings.cancel')}</button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}