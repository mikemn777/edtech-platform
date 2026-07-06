'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { tutorNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { getMyTutorProfile } from '@/lib/tutorSelf';
import { listTutorBookings, confirmBooking, rejectBooking, completeBooking, type TutorBookingRow } from '@/lib/booking';
import { Calendar, Check, Bell } from '@/components/icons';

function statusClass(s: string): string {
  if (s === 'CONFIRMED' || s === 'COMPLETED') return 'badge-ok';
  if (s === 'REJECTED' || s === 'CANCELLED') return 'badge-danger';
  return 'badge-warn';
}

type Filter = 'ALL' | 'REQUESTED' | 'CONFIRMED';

export default function TutorBookings({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);

  const [tutorId, setTutorId] = useState<string | null>(null);
  const [rows, setRows] = useState<TutorBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const p = await getMyTutorProfile();
        if (p) {
          setTutorId(p.id);
          setRows(await listTutorBookings(p.id).catch(() => []));
        }
      } finally { setLoading(false); }
    })();
  }, []);

  async function act(id: string, action: 'confirm' | 'reject' | 'complete') {
    setBusyId(id);
    const next = action === 'confirm' ? 'CONFIRMED' : action === 'reject' ? 'REJECTED' : 'COMPLETED';
    try {
      if (action === 'confirm') await confirmBooking(id);
      else if (action === 'reject') await rejectBooking(id);
      else await completeBooking(id);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
    } catch { /* leave row unchanged on failure */ } finally { setBusyId(null); }
  }

  const visible = rows.filter((r) => filter === 'ALL' || r.status === filter);
  const pendingCount = rows.filter((r) => r.status === 'REQUESTED').length;

  return (
    <DashboardShell lang={lang} title={t('tbook.title')} nav={tutorNav(lang, t)} active={`/${lang}/tutor/bookings`}>
      <div className="row between wrap gap-2">
        <div>
          <h1 className="mb-0">{t('tbook.title')}</h1>
          <p className="muted mt-0">{t('tbook.subtitle')}</p>
        </div>
        {pendingCount > 0 && <span className="badge badge-warn"><Bell width={13} height={13} /> {pendingCount} {t('tbook.pending')}</span>}
      </div>

      {loading ? (
        <div className="text-c muted mt-3"><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</div>
      ) : !tutorId ? (
        <div className="card mt-3">
          <p className="muted mb-2">{t('avail.needProfile')}</p>
          <a href={`/${lang}/tutor/profile`} className="btn btn-primary">{t('tutorEdit.title')}</a>
        </div>
      ) : (
        <>
          <div className="row gap-1 mt-2">
            {(['ALL', 'REQUESTED', 'CONFIRMED'] as Filter[]).map((f) => (
              <button key={f} className={`btn btn-sm btn-pill ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>
                {t(`tbook.filter.${f}`)}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="card text-c card-pad-lg mt-3">
              <div className="brand-mark" style={{ width: 48, height: 48, marginInline: 'auto' }}><Calendar /></div>
              <h3 className="mt-2">{t('tbook.empty.t')}</h3>
              <p className="muted mb-0">{t('tbook.empty.d')}</p>
            </div>
          ) : (
            <div className="stack gap-2 mt-3" style={{ maxWidth: 760 }}>
              {visible.map((b) => {
                const d = new Date(b.scheduledStart);
                const when = d.toLocaleString(lang === 'ar' ? 'ar' : lang === 'tr' ? 'tr' : 'en', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                const busy = busyId === b.id;
                return (
                  <div className="card" key={b.id}>
                    <div className="row between wrap gap-2">
                      <div>
                        <strong><Calendar width={14} height={14} /> {when}</strong>
                        <div className="soft small mono mt-1">{t('tbook.student')}: {b.studentId.slice(0, 8)}…</div>
                      </div>
                      <div className="row gap-2 wrap">
                        <span className={`badge ${statusClass(b.status)}`}>{t(`bookings.status.${b.status}`)}</span>
                        {b.status === 'REQUESTED' && (
                          <>
                            <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => act(b.id, 'confirm')}>
                              {busy ? <span className="spinner" /> : <><Check width={14} height={14} /> {t('tbook.confirm')}</>}
                            </button>
                            <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => act(b.id, 'reject')}>{t('tbook.reject')}</button>
                          </>
                        )}
                        {b.status === 'CONFIRMED' && (
                          <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => act(b.id, 'complete')}>{t('tbook.complete')}</button>
                        )}
                      </div>
                    </div>
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
