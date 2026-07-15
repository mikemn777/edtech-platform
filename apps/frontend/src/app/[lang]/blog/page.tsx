'use client';

import ContentPage from '@/components/ContentPage';
import { getTranslator } from '@/lib/i18n';
import { POSTS, type Lang } from '@/lib/blog';
import { FileText, ArrowRight } from '@/components/icons';

export default function BlogPage({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const l = (lang as Lang);
  const t = getTranslator(lang);
  return (
    <ContentPage lang={lang} title={t('blog.title')} lead={t('blog.lead')} wide>
      <div className="grid cols-2">
        {POSTS.map((p) => (
          <a key={p.slug} href={`/${lang}/blog/${p.slug}`} className="card card-hover">
            <div className="brand-mark" style={{ width: 40, height: 40, borderRadius: 12 }}><FileText /></div>
            <h3 className="mt-2 mb-0">{p.title[l] ?? p.title.en}</h3>
            <div className="soft small mt-1">{p.date} · {p.readMins} {t('blog.min')}</div>
            <p className="muted mt-2 mb-0">{p.excerpt[l] ?? p.excerpt.en}</p>
            <span className="row gap-1 mt-2" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('blog.read')} <ArrowRight width={15} height={15} /></span>
          </a>
        ))}
      </div>
    </ContentPage>
  );
}
