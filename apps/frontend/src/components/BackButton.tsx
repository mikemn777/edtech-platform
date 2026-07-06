'use client';

import { useRouter } from 'next/navigation';
import { getTranslator, getDirection } from '@/lib/i18n';
import { ArrowRight } from './icons';

/** Universal back button — goes to the previous page; RTL-aware arrow. */
export default function BackButton({ lang }: { lang: string }) {
  const router = useRouter();
  const t = getTranslator(lang);
  const rtl = getDirection(lang) === 'rtl';
  return (
    <button className="btn btn-ghost btn-sm" onClick={() => router.back()} aria-label={t('common.back')} title={t('common.back')}>
      <ArrowRight width={16} height={16} style={{ transform: rtl ? 'none' : 'rotate(180deg)' }} />
      <span className="hide-sm">{t('common.back')}</span>
    </button>
  );
}
