'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { studentNav, parentNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { listFavorites, removeFavorite } from '@/lib/favorites';
import { apiFetch } from '@/lib/api-client';
import { Star, Heart, ArrowRight } from '@/components/icons';

interface Prof { id: string; headline: string | null; rating: { average: number | null; count: number }; offerings: { subject: string }[] }

export default function FavoritesPage({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const session = useSession();
  const [items, setItems] = useState<Prof[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session.loading || !session.authenticated) return;
    (async () => {
      try {
        const favs = await listFavorites();
        const profs = await Promise.all(
          favs.map((f) => apiFetch<Prof>(`marketplace/tutors/${f.tutorId}`).catch(() => null)),
        );
        setItems(profs.filter((p): p is Prof => !!p));
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, [session.loading, session.authenticated]);

  async function unfav(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id));
    await removeFavorite(id).catch(() => {});
  }

  const nav = session.hasRole('parent') ? parentNav(lang, t) : studentNav(lang, t);

  return (
    <DashboardShell lang={lang} title={t('fav.title')} nav={nav} active={`/${lang}/favorites`}>
      <h1 className="mb-0">{t('fav.title')}</h1>
      <p className="muted">{t('fav.subtitle')}</p>

      {loading && <div className="text-c muted mt-3"><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</div>}

      {!loading && items.length === 0 && (
        <div className="card text-c card-pad-lg mt-3">
          <div className="brand-mark" style={{ width: 48, height: 48, marginInline: 'auto' }}><Heart /></div>
          <h3 className="mt-2">{t('fav.empty.t')}</h3>
          <p className="muted">{t('fav.empty.d')}</p>
          <a href={`/${lang}/tutors`} className="btn btn-primary">{t('nav.tutors')}</a>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid cols-3 mt-3">
          {items.map((p) => {
            const name = p.headline || t('tutors.tutor');
            const subjects = [...new Set(p.offerings.map((o) => o.subject))];
            return (
              <div key={p.id} className="card card-hover" style={{ position: 'relative' }}>
                <button className="icon-btn" style={{ position: 'absolute', top: '.75rem', insetInlineEnd: '.75rem', color: 'var(--danger-500)' }} onClick={() => unfav(p.id)} aria-label={t('fav.remove')}>
                  <Heart width={18} height={18} />
                </button>
                <a href={`/${lang}/tutors/${p.id}`} style={{ display: 'block' }}>
                  <div className="row gap-2" style={{ paddingInlineEnd: '2.5rem' }}>
                    <div className="avatar">{name.slice(0, 2).toUpperCase()}</div>
                    <div><strong>{name}</strong><div className="soft small" style={{ textTransform: 'capitalize' }}>{subjects.slice(0, 2).join(' · ')}</div></div>
                  </div>
                  <div className="row gap-1 mt-2" style={{ color: 'var(--warn-500)' }}>
                    <Star width={15} height={15} />
                    <span className="muted small">{p.rating.average ? p.rating.average.toFixed(1) : t('tutors.new')} · {p.rating.count} {t('home.card.reviews')}</span>
                  </div>
                  <span className="row gap-1 mt-3" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('tutors.view')} <ArrowRight width={15} height={15} /></span>
                </a>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
