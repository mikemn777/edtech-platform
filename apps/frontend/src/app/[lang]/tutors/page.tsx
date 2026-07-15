'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import BackButton from '@/components/BackButton';
import { getTranslator } from '@/lib/i18n';
import { useApiQuery } from '@/lib/useApi';
import { getAccessToken } from '@/lib/auth';
import { addFavorite, removeFavorite, type FavoriteRow } from '@/lib/favorites';
import type { PaginatedResult } from '@edu/types';
import { Star, Search, Check, ArrowRight, Heart, HeartFilled } from '@/components/icons';

interface TutorCard {
  id: string;
  headline: string | null;
  rating: { average: number | null; count: number };
  subjects: string[];
  offerings: { subject: string; title: string; price: { amount: number; currencyId: string | null } | null }[];
}

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Arabic', 'Computer Science'];

export default function TutorsPage({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const router = useRouter();
  const [q, setQ] = useState('');
  const [subject, setSubject] = useState<string | null>(null);
  const [sort, setSort] = useState<'rating' | 'newest'>('rating');
  const [page, setPage] = useState(1);

  const loggedIn = typeof window !== 'undefined' && !!getAccessToken();
  const favQuery = useApiQuery<FavoriteRow[]>(loggedIn ? 'favorites' : null);
  const [favSet, setFavSet] = useState<Set<string>>(new Set());
  useEffect(() => { if (favQuery.data) setFavSet(new Set(favQuery.data.map((f) => f.tutorId))); }, [favQuery.data]);

  // Honor ?subject= and ?q= from the URL (used by per-subject landing pages).
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const s = sp.get('subject');
    const qq = sp.get('q');
    if (s) setSubject(s);
    if (qq) setQ(qq);
  }, []);

  async function toggleFav(tutorId: string) {
    if (!loggedIn) { router.push(`/${lang}/login`); return; }
    const isFav = favSet.has(tutorId);
    const next = new Set(favSet);
    if (isFav) { next.delete(tutorId); setFavSet(next); await removeFavorite(tutorId).catch(() => {}); }
    else { next.add(tutorId); setFavSet(next); await addFavorite(tutorId).catch(() => {}); }
  }

  const qs = new URLSearchParams();
  qs.set('page', String(page));
  qs.set('pageSize', '12');
  qs.set('sort', sort);
  if (q.trim()) qs.set('q', q.trim());
  if (subject) qs.set('subject', subject.toLowerCase());

  const { data, error, loading } = useApiQuery<PaginatedResult<TutorCard>>(`marketplace/tutors?${qs.toString()}`, [page, subject, sort, q]);
  const rows = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <SiteHeader lang={lang} />
      <main>
        <section className="section" style={{ background: 'var(--bg-elev)', borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
          <div className="container">
            <div style={{ marginBottom: '.5rem' }}><BackButton lang={lang} /></div>
            <h1 className="mb-0">{t('tutors.title')}</h1>
            <p className="muted">{t('tutors.subtitle')}</p>
            <div className="card" style={{ padding: '.6rem', display: 'flex', gap: '.5rem', alignItems: 'center', maxWidth: 620 }}>
              <span className="soft" style={{ paddingInlineStart: '.4rem', display: 'grid', placeItems: 'center' }}><Search width={18} height={18} /></span>
              <input
                className="input"
                style={{ border: 'none', background: 'transparent', padding: '.4rem' }}
                placeholder={t('tutors.search.ph')}
                value={q}
                onChange={(e) => { setPage(1); setQ(e.target.value); }}
              />
            </div>
            <div className="row wrap gap-1 mt-2">
              <button className={`btn btn-sm btn-pill ${subject === null ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setPage(1); setSubject(null); }}>{t('tutors.all')}</button>
              {SUBJECTS.map((sName) => (
                <button key={sName} className={`btn btn-sm btn-pill ${subject === sName ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setPage(1); setSubject(sName); }}>{sName}</button>
              ))}
              <select className="select" style={{ width: 'auto', marginInlineStart: 'auto' }} value={sort} onChange={(e) => { setPage(1); setSort(e.target.value as 'rating' | 'newest'); }}>
                <option value="rating">{t('tutors.sort.rating')}</option>
                <option value="newest">{t('tutors.sort.newest')}</option>
              </select>
            </div>
          </div>
        </section>

        <section className="section container" style={{ paddingTop: '2rem' }}>
          {loading && <div className="text-c muted"><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</div>}
          {error && !loading && <div className="alert alert-danger">{error}</div>}

          {!loading && !error && rows.length === 0 && (
            <div className="card text-c card-pad-lg">
              <div className="brand-mark" style={{ width: 48, height: 48, marginInline: 'auto' }}><Search /></div>
              <h3 className="mt-2">{t('tutors.empty.t')}</h3>
              <p className="muted">{t('tutors.empty.d')}</p>
              <a href={`/${lang}/register?role=tutor`} className="btn btn-primary">{t('footer.becomeTutor')}</a>
            </div>
          )}

          {rows.length > 0 && (
            <div className="grid cols-3">
              {rows.map((tu) => {
                const name = tu.headline || t('tutors.tutor');
                const isFav = favSet.has(tu.id);
                return (
                  <a key={tu.id} href={`/${lang}/tutors/${tu.id}`} className="card card-hover" style={{ position: 'relative' }}>
                    <button
                      className="icon-btn"
                      style={{ position: 'absolute', top: '.75rem', insetInlineEnd: '.75rem', color: isFav ? 'var(--danger-500)' : 'var(--text-soft)', background: 'var(--surface)' }}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFav(tu.id); }}
                      aria-label={isFav ? t('fav.remove') : t('fav.add')}
                      title={isFav ? t('fav.remove') : t('fav.add')}
                    >
                      {isFav ? <HeartFilled width={18} height={18} /> : <Heart width={18} height={18} />}
                    </button>
                    <div className="row gap-2" style={{ paddingInlineEnd: '2.5rem' }}>
                      <div className="avatar">{name.slice(0, 2).toUpperCase()}</div>
                      <div><strong>{name}</strong><div className="soft small" style={{ textTransform: 'capitalize' }}>{tu.subjects.slice(0, 2).join(' · ')}</div></div>
                    </div>
                    <div className="row gap-1 mt-2" style={{ color: 'var(--warn-500)' }}>
                      <Star width={15} height={15} />
                      <span className="muted small">{tu.rating.average ? tu.rating.average.toFixed(1) : t('tutors.new')} · {tu.rating.count} {t('home.card.reviews')}</span>
                      <span className="badge badge-ok" style={{ marginInlineStart: 'auto' }}><Check width={12} height={12} /> {t('home.card.verified')}</span>
                    </div>
                    <div className="row wrap gap-1 mt-2">
                      {tu.subjects.slice(0, 3).map((s) => <span key={s} className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{s}</span>)}
                    </div>
                    <span className="row gap-1 mt-3" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('tutors.view')} <ArrowRight width={15} height={15} /></span>
                  </a>
                );
              })}
            </div>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="row center gap-2 mt-4">
              <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>{t('common.prev')}</button>
              <span className="muted small">{meta.page} / {meta.totalPages}</span>
              <button className="btn btn-outline btn-sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>{t('common.next')}</button>
            </div>
          )}
        </section>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}