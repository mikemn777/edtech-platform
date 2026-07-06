'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import BackButton from '@/components/BackButton';
import { getTranslator } from '@/lib/i18n';
import { useApiQuery } from '@/lib/useApi';
import { getAccessToken } from '@/lib/auth';
import { ensureStudentProfileId, createBooking } from '@/lib/booking';
import { ApiError } from '@/lib/api-client';
import { Star, Check, Calendar } from '@/components/icons';

interface PublicProfile {
  id: string;
  headline: string | null;
  bio: string | null;
  rating: { average: number | null; count: number };
  offerings: { id: string; subject: string; title: string; description: string | null; price: { amount: number; currencyId: string | null } | null }[];
}
interface Slot { id: string; startAt: string; endAt: string; status: string }

export default function TutorProfilePage({ params }: { params: { lang: string; id: string } }) {
  const { lang, id } = params;
  const t = getTranslator(lang);
  const router = useRouter();
  const { data, error, loading } = useApiQuery<PublicProfile>(`marketplace/tutors/${id}`);
  const availability = useApiQuery<Slot[]>(`tutors/${id}/availability`);

  const [booking, setBooking] = useState<string | null>(null);
  const [booked, setBooked] = useState<Set<string>>(new Set());
  const [bookError, setBookError] = useState<string | null>(null);

  const slots = (availability.data ?? [])
    .filter((s) => s.status === 'ACTIVE' && new Date(s.startAt) > new Date())
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .slice(0, 8);

  async function book(slot: Slot) {
    if (!getAccessToken()) { router.push(`/${lang}/login`); return; }
    if (!data) return;
    setBookError(null);
    setBooking(slot.id);
    try {
      const studentId = await ensureStudentProfileId();
      await createBooking({ studentId, tutorId: data.id, scheduledStart: slot.startAt, scheduledEnd: slot.endAt, availabilityId: slot.id });
      setBooked((prev) => new Set(prev).add(slot.id));
    } catch (e) {
      setBookError(e instanceof ApiError ? (e.body?.error?.message ?? t('booking.failed')) : t('auth.network'));
    } finally {
      setBooking(null);
    }
  }

  return (
    <>
      <SiteHeader lang={lang} />
      <main className="section container">
        <div style={{ marginBottom: '1rem' }}><BackButton lang={lang} /></div>
        {loading && <div className="text-c muted"><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</div>}
        {error && !loading && (
          <div className="card text-c card-pad-lg">
            <h3>{t('tutorProfile.notfound.t')}</h3>
            <p className="muted">{t('tutorProfile.notfound.d')}</p>
            <a href={`/${lang}/tutors`} className="btn btn-primary">{t('tutors.title')}</a>
          </div>
        )}
        {data && (
          <div className="grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: '2rem', alignItems: 'start' }}>
            <div>
              <div className="row gap-3">
                <div className="avatar" style={{ width: 72, height: 72, fontSize: '1.5rem' }}>{(data.headline || 'T').slice(0, 2).toUpperCase()}</div>
                <div>
                  <div className="row gap-2 wrap">
                    <h1 className="mb-0">{data.headline || t('tutors.tutor')}</h1>
                    <span className="badge badge-ok"><Check width={13} height={13} /> {t('home.card.verified')}</span>
                  </div>
                  <div className="row gap-1 mt-1" style={{ color: 'var(--warn-500)' }}>
                    <Star width={16} height={16} />
                    <span className="muted small">{data.rating.average ? data.rating.average.toFixed(1) : t('tutors.new')} · {data.rating.count} {t('home.card.reviews')}</span>
                  </div>
                </div>
              </div>

              {data.bio && (<><h3 className="mt-4">{t('tutorProfile.about')}</h3><p className="muted">{data.bio}</p></>)}

              <h3 className="mt-4">{t('tutorProfile.offerings')}</h3>
              <div className="stack gap-2">
                {data.offerings.length === 0 && <p className="muted">{t('tutorProfile.noOfferings')}</p>}
                {data.offerings.map((o) => (
                  <div className="card" key={o.id}>
                    <div className="row between wrap gap-1">
                      <div>
                        <strong>{o.title}</strong>
                        <div className="soft small" style={{ textTransform: 'capitalize' }}>{o.subject}</div>
                      </div>
                      {o.price && <span className="badge">{o.price.amount}</span>}
                    </div>
                    {o.description && <p className="muted small mt-2 mb-0">{o.description}</p>}
                  </div>
                ))}
              </div>
            </div>

            <aside className="card card-pad-lg" style={{ position: 'sticky', top: 'calc(var(--header-h) + 1rem)' }}>
              <h3 className="mt-0">{t('tutorProfile.book.t')}</h3>
              <p className="muted small">{t('tutorProfile.availability')}</p>

              {bookError && <div className="alert alert-danger mb-2">{bookError}</div>}

              {slots.length === 0 ? (
                <p className="soft small">{t('tutorProfile.noSlots')}</p>
              ) : (
                <div className="stack gap-1" style={{ maxHeight: 320, overflow: 'auto' }}>
                  {slots.map((s) => {
                    const d = new Date(s.startAt);
                    const day = d.toLocaleDateString(lang === 'ar' ? 'ar' : lang === 'tr' ? 'tr' : 'en', { weekday: 'short', month: 'short', day: 'numeric' });
                    const time = d.toLocaleTimeString(lang === 'ar' ? 'ar' : 'en', { hour: '2-digit', minute: '2-digit' });
                    const isBooked = booked.has(s.id);
                    const isBusy = booking === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => book(s)}
                        disabled={isBooked || isBusy}
                        className="row between"
                        style={{
                          border: `1px solid ${isBooked ? 'var(--ok-500)' : 'var(--border-2)'}`,
                          background: isBooked ? 'rgba(16,185,129,.08)' : 'var(--surface)',
                          color: 'var(--text)', borderRadius: 'var(--radius-sm)', padding: '.55rem .75rem',
                          cursor: isBooked || isBusy ? 'default' : 'pointer', font: 'inherit',
                        }}
                      >
                        <span className="small"><Calendar width={14} height={14} /> {day} · {time}</span>
                        {isBooked ? <span className="badge badge-ok"><Check width={12} height={12} /> {t('booking.requested')}</span>
                          : isBusy ? <span className="spinner" style={{ color: 'var(--primary)' }} />
                          : <span className="small" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('booking.book')}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="soft small text-c mt-2">{t('booking.note')}</p>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
