'use client';

import ContentPage from '@/components/ContentPage';
import { getTranslator } from '@/lib/i18n';
import { SUBJECTS, subjectName } from '@/lib/catalog';
import { Book, ArrowRight } from '@/components/icons';

/** Directory of per-subject tutor landing pages (AlGooru-style discovery). */
export default function SubjectsPage({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  return (
    <ContentPage lang={lang} title={t('subjects.title')} lead={t('subjects.lead')} wide>
      <div className="grid cols-3">
        {SUBJECTS.map((s) => (
          <a key={s.slug} href={`/${lang}/subjects/${s.slug}`} className="card card-hover">
            <div className="brand-mark" style={{ width: 42, height: 42, borderRadius: 12 }}><Book /></div>
            <h3 className="mt-2 mb-0">{subjectName(s, lang)}</h3>
            <span className="row gap-1 mt-2" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              {t('subjects.viewTutors')} <ArrowRight width={15} height={15} />
            </span>
          </a>
        ))}
      </div>
    </ContentPage>
  );
}
