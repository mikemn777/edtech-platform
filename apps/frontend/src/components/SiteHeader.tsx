'use client';

import { useState } from 'react';
import { getTranslator } from '@/lib/i18n';
import { useSession, homePathForRoles } from '@/lib/session';
import ThemeToggle from './ThemeToggle';
import RefreshButton from './RefreshButton';
import LangSwitcher from './LangSwitcher';
import { Menu, Grid } from './icons';

export default function SiteHeader({ lang }: { lang: string }) {
  const t = getTranslator(lang);
  const [open, setOpen] = useState(false);
  const session = useSession();
  const dashHref = homePathForRoles(lang, session.roles);
  const nav = [
    { href: `/${lang}/tutors`, label: t('nav.tutors') },
    { href: `/${lang}/courses`, label: t('nav.courses') },
    { href: `/${lang}/pricing`, label: t('nav.pricing') },
    { href: `/${lang}/about`, label: t('nav.about') },
  ];

  return (
    <header className="site-header">
      <div className="container">
        <a href={`/${lang}`} className="brand">
          <span className="brand-mark">E</span>
          <span>Eduspark</span>
        </a>

        <nav className="nav hide-sm">
          {nav.map((n) => (
            <a key={n.href} href={n.href}>{n.label}</a>
          ))}
        </nav>

        <div className="row gap-1">
          <a href={`/${lang}/register`} className="nav-link-plain hide-sm">{t('footer.becomeTutor')}</a>
          <RefreshButton lang={lang} />
          <ThemeToggle />
          <LangSwitcher current={lang} />
          {session.authenticated ? (
            <a href={dashHref} className="btn header-cta hide-sm"><Grid width={16} height={16} /> {t('nav.dashboard')}</a>
          ) : (
            <>
              <a href={`/${lang}/login`} className="btn header-ghost hide-sm">{t('nav.signin')}</a>
              <a href={`/${lang}/start`} className="btn header-cta hide-sm">{t('cta.getStarted')}</a>
            </>
          )}
          <button className="icon-btn" style={{ display: 'none' }} onClick={() => setOpen((o) => !o)} aria-label="Menu" data-mobile-menu>
            <Menu width={18} height={18} />
          </button>
        </div>
      </div>

      {open && (
        <div className="container header-mobile" style={{ paddingBottom: '1rem' }}>
          <div className="stack gap-1">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="btn btn-ghost btn-block" style={{ justifyContent: 'flex-start' }}>{n.label}</a>
            ))}
            <a href={`/${lang}/register`} className="btn btn-ghost btn-block" style={{ justifyContent: 'flex-start' }}>{t('footer.becomeTutor')}</a>
            <div className="divider" />
            {session.authenticated ? (
              <a href={dashHref} className="btn btn-primary btn-block">{t('nav.dashboard')}</a>
            ) : (
              <>
                <a href={`/${lang}/login`} className="btn btn-outline btn-block">{t('nav.signin')}</a>
                <a href={`/${lang}/start`} className="btn btn-primary btn-block">{t('cta.getStarted')}</a>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`@media (max-width:760px){[data-mobile-menu]{display:grid !important}}`}</style>
    </header>
  );
}
