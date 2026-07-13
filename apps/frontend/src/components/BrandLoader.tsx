'use client';

import { getTranslator } from '@/lib/i18n';

/** Branded full-screen loading state — shown while the session/page resolves. */
export default function BrandLoader({ lang }: { lang: string }) {
  const t = getTranslator(lang);
  return (
    <div className="page-loader">
      <div className="page-loader-mark brand-mark">E</div>
      <div className="page-loader-name">Eduspark</div>
      <span className="spinner" style={{ color: 'var(--primary)', width: 22, height: 22 }} />
      <p className="muted small mb-0">{t('common.loading')}</p>
    </div>
  );
}
