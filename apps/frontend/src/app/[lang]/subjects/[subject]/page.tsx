'use client';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import BackButton from '@/components/BackButton';
import { getTranslator } from '@/lib/i18n';
import { useApiQuery } from '@/lib/useApi';
import { subjectBySlug, subjectName, subjectBlurb, SUBJECTS } from '@/lib/catalog';
import type { PaginatedResult } from '@edu/types';
import { Star, ArrowRight, Shield, Calendar, Sparkles } from '@/components/icons';

interface TutorCard {
  id: string;
  headline: string | null;
  rating: { average: number | null; count: number };
  subjects: string[];
}

export default function SubjectTutorsPage({ params }: { params: { lang: string; subject: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const subject = subjectBySlug(params.subject);

  const name = subject ? subjectName(subject, lang) : params.subject;
  const qs = new URLSearchParams({ page: '1', pageSize: '12', sort: 'rating' });
  if (subject) qs.set('subject', subject.api);
  const { data, loading } = useApiQuery<PaginatedResult<TutorCard>>(
    subject ? `marketplace/tutors?${qs.toString()}` : null,
    [params.subject],
  );
  const rows = data?.data ?? [];

  const perks = [
    { icon: <Shield />, label: t('subjects.perk.vetted') },
    { icon: <Calendar />, label: t('subjects.perk.flexible') },
    { icon: <Sparkles />, label: t('subjects.perk.tailored') },
  ];

  return (
    <>
      <SiteHeader lang={lang} />
      <main>
        <section className="section" style={{ background: 'var(--bg-elev)', borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
          <div className="container">
            <div style={{ marginBottom: '.5rem' }}><BackButton lang={lang} /></div>
            <span className="eyebrow">{t('subjects.eyebrow')}</span>
            <h1 className="mb-0">{t('subjects.heroPrefix')} {name}</h1>
            <p className="lead mt-1">{subjectBlurb(name, lang)}</p>
            <div className="row gap-2 wrap mt-3">
              <a href={`/${lang}/tutors?subject=${subject?.api ?? ''}`} className="btn btn-primary btn-lg">{t('subjects.browseAll')} <ArrowRight width={18} height={18} /></a>
              <a href={`/${lang}/start`} className="btn btn-outline btn-lg">{t('home.hero.find')}</a>
            </div>
            <div className="row gap-3 wrap mt-3">
              {perks.map((p) => (
                <span key={p.label} className="row gap-1 muted small"><span style={{ color: 'var(--primary)' }}>{p.icon}</span> {p.label}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="section container" style={{ paddingTop: '2.5rem' }}>
          <h2>{t('subjects.availableIn')} {name}</h2>
          {loading && <div className="text-c muted"><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</div>}
          {!loading && rows.length === 0 && (
            <div className="card text-c card-pad-lg">
              <h3 className="mt-0">{t('subjects.empty.t')}</h3>
              <p className="muted">{t('subjects.empty.d')}</p>
              <a href={`/${lang}/tutors`} className="btn btn-primary">{t('nav.tutors')}</a>
            </div>
          )}
          {rows.length > 0 && (
            <div className="grid cols-3">
              {rows.map((tu) => {
                const nm = tu.headline || t('tutors.tutor');
                return (
                  <a key={tu.id} href={`/${lang}/tutors/${tu.id}`} className="card card-hover">
                    <div className="row gap-2">
                      <div className="avatar">{nm.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <strong>{nm}</strong>
                        <div className="row gap-1 small" style={{ color: 'var(--warn-500)' }}>
                          <Star width={14} height={14} />
                          <span className="muted">{tu.rating.average?.toFixed(1) ?? '—'} · {tu.rating.count}</span>
                        </div>
                      </div>
                    </div>
                    <span className="row gap-1 mt-2" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('common.open')} <ArrowRight width={15} height={15} /></span>
                  </a>
                );
              })}
            </div>
          )}

          <div className="card card-pad-lg mt-4">
            <h3 className="mt-0">{t('subjects.other')}</h3>
            <div className="row wrap gap-1 mt-2">
              {SUBJECTS.filter((s) => s.slug !== params.subject).map((s) => (
                <a key={s.slug} href={`/${lang}/subjects/${s.slug}`} className="btn btn-outline btn-sm btn-pill">{subjectName(s, lang)}</a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
