'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session';
import { getTranslator } from '@/lib/i18n';
import ThemeToggle from './ThemeToggle';
import BackButton from './BackButton';
import LangSwitcher from './LangSwitcher';
import BrandLoader from './BrandLoader';
import { Logout } from './icons';

export interface NavItem {
  href: string;
  label: string;
  icon?: ReactNode;
  soon?: boolean;
}

/**
 * Authenticated app shell: role-aware sidebar + topbar. Guards the route — if
 * there is no session it redirects to login.
 */
export default function DashboardShell({
  lang,
  title,
  nav,
  active,
  children,
}: {
  lang: string;
  title: string;
  nav: NavItem[];
  active: string;
  children: ReactNode;
}) {
  const t = getTranslator(lang);
  const router = useRouter();
  const session = useSession();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (session.loading) return;
    if (!session.authenticated) router.replace(`/${lang}/login`);
    else setReady(true);
  }, [session.loading, session.authenticated, lang, router]);

  if (!ready) return <BrandLoader lang={lang} />;

  const initials = (session.email ?? 'U').slice(0, 2).toUpperCase();

  return (
    <div className="app">
      <aside className="sidebar">
        <a href={`/${lang}`} className="brand" style={{ marginBottom: '1.25rem' }}>
          <span className="brand-mark">E</span><span>Eduspark</span>
        </a>
        <nav>
          {nav.map((n) =>
            n.soon ? (
              <span key={n.label} className="nav-item" style={{ opacity: 0.55, cursor: 'default' }}>
                {n.icon}<span>{n.label}</span>
                <span className="badge badge-neutral" style={{ marginInlineStart: 'auto' }}>{t('common.soon')}</span>
              </span>
            ) : (
              <a key={n.href} href={n.href} className={`nav-item${active === n.href ? ' active' : ''}`}>
                {n.icon}<span>{n.label}</span>
              </a>
            ),
          )}
        </nav>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="row gap-1"><BackButton lang={lang} /><strong>{title}</strong></div>
          <div className="row gap-1">
            <ThemeToggle />
            <LangSwitcher current={lang} />
            <div className="avatar" title={session.email ?? ''}>{initials}</div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { session.signOut(); router.replace(`/${lang}/login`); }}
            >
              <Logout width={16} height={16} /> <span className="hide-sm">{t('nav.signout')}</span>
            </button>
          </div>
        </header>
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}