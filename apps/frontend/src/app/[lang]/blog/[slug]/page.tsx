'use client';

import ContentPage from '@/components/ContentPage';
import { getTranslator } from '@/lib/i18n';
import { postBySlug, POSTS, type Lang } from '@/lib/blog';
import { ArrowRight } from '@/components/icons';

export default function BlogPostPage({ params }: { params: { lang: string; slug: string } }) {
  const lang = params.lang;
  const l = (lang as Lang);
  const t = getTranslator(lang);
  const post = postBySlug(params.slug);

  if (!post) {
    return (
      <ContentPage lang={lang} title={t('blog.notFound.t')}>
        <p className="muted">{t('blog.notFound.d')}</p>
        <a href={`/${lang}/blog`} className="btn btn-primary">{t('blog.title')}</a>
      </ContentPage>
    );
  }

  const others = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);
  return (
    <ContentPage lang={lang} title={post.title[l] ?? post.title.en} lead={`${post.date} · ${post.readMins} ${t('blog.min')}`}>
      <article className="stack gap-3">
        {post.body.map((para, i) => (
          <p key={i} style={{ fontSize: '1.05rem', lineHeight: 1.75 }}>{para[l] ?? para.en}</p>
        ))}
      </article>
      <div className="divider" />
      <h3>{t('blog.more')}</h3>
      <div className="grid cols-2">
        {others.map((p) => (
          <a key={p.slug} href={`/${lang}/blog/${p.slug}`} className="card card-hover">
            <strong>{p.title[l] ?? p.title.en}</strong>
            <span className="row gap-1 mt-1 small" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('blog.read')} <ArrowRight width={14} height={14} /></span>
          </a>
        ))}
      </div>
    </ContentPage>
  );
}
