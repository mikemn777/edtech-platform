'use client';

import { useRouter, usePathname } from 'next/navigation';
import { getTranslator, getDirection } from '@/lib/i18n';
import { useSession, homePathForRoles } from '@/lib/session';
import { ArrowRight } from './icons';

/**
 * Universal back button. Instead of raw browser history (which can land on the
 * login page or an unrelated page), it goes UP one level in the app hierarchy,
 * falling back to the user's home page. RTL-aware arrow.
 */
export default function BackButton({ lang }: { lang: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();
  const t = getTranslator(lang);
  const rtl = getDirection(lang) === 'rtl';

  function goBack() {
    const segs = (pathname || `/${lang}`).split('/').filter(Boolean); // [lang, a, b, ...]
    const home = session.authenticated ? homePathForRoles(lang, session.roles) : `/${lang}`;
    let target: string;
    if (segs.length > 2) {
      target = '/' + segs.slice(0, -1).join('/'); // up one level (e.g. /en/parent/children -> /en/parent)
    } else {
      target = home; // already at a top-level page -> go home
    }
    if (target === pathname) target = `/${lang}`; // avoid navigating to the same page
    router.push(target);
  }

  return (
    <button className="btn btn-ghost btn-sm" onClick={goBack} aria-label={t('common.back')} title={t('common.back')}>
      <ArrowRight width={16} height={16} style={{ transform: rtl ? 'none' : 'rotate(180deg)' }} />
      <span className="hide-sm">{t('common.back')}</span>
    </button>
  );
}
