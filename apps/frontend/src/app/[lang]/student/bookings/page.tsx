'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { studentNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { getBookingIds, getBooking, cancelBooking } from '@/lib/booking';
import { apiFetch } from '@/lib/api-client';
import { Calendar } from '@/components/icons';

interface Booking { id: string; tutorId: string; scheduledStart: string; scheduledEnd: string; status: string }
interface Row { booking: Booking; tutorName: string }

function statusClass(s: string): string {
  if (s === 'CONFIRMED' || s === 'COMPLETED') return 'badge-ok';
  if (s === 'REJECTED' || s === 'CANCELLED') return 'badge-danger';
  return 'badge-warn';
}

export default function StudentBookings({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const ids = getBookingIds();
      const results = await Promise.all(ids.map(async (id) => {
        try {
          const b = await getBooking<Booking>(id);
          let tutorName = t('tutors.tutor');
          try { const p = await apiFetch<{ headline: string | null }>(`marketplace/tutors/${b.tutorId}`); tutorName = p.headline || tutorName; } catch { /* ignore */ }
          return { booking: b, tutorName } as Row;
        } catch { return null; }
      }));
      setItems(results.filter((r): r is Row => !!r));
      setLoading(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function onCancel(id: string) {
    setItems((prev) => prev.map((it) => it.booking.id === id ? { ...it, booking: { ...it.booking, status: 'CANCELLED' } } : it));
    await cancelBooking(id).catch(() => {});
  }

  return (
    <DashboardShell lang={lang} title={t('bookings.title')} nav={studentNav(lang, t)} active={`/${lang}/student/bookings`}>
      <h1 className="mb-0">{t('bookings.title')}</h1>
      <p className="muted">{t('bookings.subtitle')}</p>

      {loading && <div className="text-c muted mt-3"><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</div>}

      {!loading && items.length === 0 && (
        <div className="card text-c card-pad-lg mt-3">
          <div className="brand-mark" style={{ width: 48, height: 48, marginInline: 'auto' }}><Calendar /></div>
          <h3 className="mt-2">{t('bookings.empty.t')}</h3>
          <p className="muted">{t('bookings.empty.d')}</p>
          <a href={`/${lang}/tutors`} className="btn btn-primary">{t('nav.tutors')}</a>
        </div>
      )}

      {items.length > 0 && (
        <div className="stack gap-2 mt-3">
          {items.map(({ booking, tutorName }) => {
            const d = new Date(booking.scheduledStart);
            const when = d.toLocaleString(lang === 'ar' ? 'ar' : lang === 'tr' ? 'tr' : 'en', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const active = booking.status === 'REQUESTED' || booking.status === 'CONFIRMED';
            return (
              <div className="card" key={booking.id}>
                <div className="row between wrap gap-2">
                  <div className="row gap-2">
                    <div className="avatar">{tutorName.slice(0, 2).toUpperCase()}</div>
                    <div>
                      <strong>{tutorName}</strong>
                      <div className="muted small"><Calendar width={13} height={13} /> {when}</div>
                    </div>
                  </div>
                  <div className="row gap-2">
                    <span className={`badge ${statusClass(booking.status)}`}>{t(`bookings.status.${booking.status}`)}</span>
                    {active && <button className="btn btn-outline btn-sm" onClick={() => onCancel(booking.id)}>{t('bookings.cancel')}</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}