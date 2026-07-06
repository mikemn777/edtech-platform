'use client';

import ContentPage from '@/components/ContentPage';
import { getTranslator } from '@/lib/i18n';
import { useApiQuery } from '@/lib/useApi';
import { Book, ArrowRight } from '@/components/icons';

interface Course { id: string; title: string; subject: string; description: string | null }

export default function CoursesPage({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const { data, error, loading } = useApiQuery<Course[]>('curriculum/courses');
  const courses = data ?? [];

  return (
    <ContentPage lang={lang} title={t('courses.title')} lead={t('courses.lead')} wide>
      {loading && <div className="text-c muted"><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</div>}
      {error && !loading && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && courses.length === 0 && (
        <div className="card text-c card-pad-lg">
          <div className="brand-mark" style={{ width: 48, height: 48, marginInline: 'auto' }}><Book /></div>
          <h3 className="mt-2">{t('courses.empty.t')}</h3>
          <p className="muted">{t('courses.empty.d')}</p>
          <a href={`/${lang}/tutors`} className="btn btn-primary">{t('nav.tutors')}</a>
        </div>
      )}
      {courses.length > 0 && (
        <div className="grid cols-3">
          {courses.map((c) => (
            <div key={c.id} className="card card-hover">
              <div className="brand-mark" style={{ width: 40, height: 40 }}><Book /></div>
              <h3 className="mt-2">{c.title}</h3>
              <div className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{c.subject}</div>
              {c.description && <p className="muted small mt-2">{c.description}</p>}
              <span className="row gap-1" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('common.open')} <ArrowRight width={15} height={15} /></span>
            </div>
          ))}
        </div>
      )}
    </ContentPage>
  );
}