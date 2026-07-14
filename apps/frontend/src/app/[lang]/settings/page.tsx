'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import DashboardShell, { type NavItem } from '@/components/DashboardShell';
import { adminNav, studentNav, parentNav, tutorNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { useSession, OPERATIONAL_ROLES } from '@/lib/session';
import { resolveInitialTheme, setTheme, type Theme } from '@/lib/theme';
import { User, Check, Sun, Moon, Globe } from '@/components/icons';

const LANGS: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'tr', label: 'Türkçe' },
];

function navForRoles(lang: string, t: (k: string) => string, roles: string[]): NavItem[] {
  if (roles.some((r) => OPERATIONAL_ROLES.includes(r))) return adminNav(lang, t);
  if (roles.includes('tutor')) return tutorNav(lang, t);
  if (roles.includes('parent')) return parentNav(lang, t);
  return studentNav(lang, t);
}

export default function SettingsPage({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const s = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [theme, setThemeState] = useState<Theme>('light');
  const [copied, setCopied] = useState(false);
  useEffect(() => { setThemeState(resolveInitialTheme()); }, []);

  function pickTheme(next: Theme) { setTheme(next); setThemeState(next); }
  function switchLang(code: string) {
    const parts = (pathname || `/${lang}`).split('/');
    if (parts.length > 1) parts[1] = code;
    router.push(parts.join('/') || `/${code}`);
  }
  async function copyId() {
    try { await navigator.clipboard.writeText(s.claims?.sub ?? ''); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  }

  const isTutor = s.roles.includes('tutor');

  return (
    <DashboardShell lang={lang} title={t('settings.title')} nav={navForRoles(lang, t, s.roles)} active={`/${lang}/settings`}>
      <h1 className="mb-0">{t('settings.title')}</h1>
      <p className="muted">{t('settings.subtitle')}</p>

      {/* Account */}
      <div className="card mt-3" style={{ maxWidth: 680 }}>
        <div className="row gap-2">
          <div className="brand-mark" style={{ width: 40, height: 40 }}><User /></div>
          <h3 className="mb-0">{t('settings.account')}</h3>
        </div>
        <div className="stack gap-2 mt-3">
          <div className="stack gap-1">
            <span className="muted small">{t('settings.email')}</span>
            <strong>{s.email}</strong>
          </div>
          <div className="divider" />
          <div className="stack gap-1">
            <span className="muted small">{t('settings.roles')}</span>
            <span className="row gap-1 wrap">
              {s.roles.map((r) => <span key={r} className="badge badge-neutral">{r}</span>)}
            </span>
          </div>
          <div className="divider" />
          <div className="stack gap-1">
            <span className="muted small">{t('settings.accountId')}</span>
            <span className="row gap-1 wrap">
              <code className="mono small" style={{ background: 'var(--surface-2)', padding: '.3rem .55rem', borderRadius: 8, userSelect: 'all' }}>{(s.claims?.sub ?? '').slice(0, 13)}…</code>
              <button className="btn btn-outline btn-sm" onClick={copyId}>{copied ? <><Check width={13} height={13} /> {t('kids.copied')}</> : t('kids.copy')}</button>
            </span>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card mt-3" style={{ maxWidth: 680 }}>
        <div className="row gap-2">
          <div className="brand-mark" style={{ width: 40, height: 40 }}><Globe /></div>
          <h3 className="mb-0">{t('settings.prefs')}</h3>
        </div>

        <div className="mt-3">
          <div className="label">{t('settings.language')}</div>
          <div className="row gap-1 wrap mt-1">
            {LANGS.map((l) => (
              <button key={l.code} onClick={() => switchLang(l.code)}
                className={`btn btn-sm ${l.code === lang ? 'btn-primary' : 'btn-outline'}`}>
                {l.code === lang && <Check width={13} height={13} />} {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <div className="label">{t('settings.appearance')}</div>
          <div className="row gap-1 mt-1">
            <button onClick={() => pickTheme('light')} className={`btn btn-sm ${theme === 'light' ? 'btn-primary' : 'btn-outline'}`}><Sun width={14} height={14} /> {t('settings.light')}</button>
            <button onClick={() => pickTheme('dark')} className={`btn btn-sm ${theme === 'dark' ? 'btn-primary' : 'btn-outline'}`}><Moon width={14} height={14} /> {t('settings.dark')}</button>
          </div>
        </div>
      </div>

      {/* Profile shortcut */}
      <div className="card mt-3" style={{ maxWidth: 680 }}>
        <h3 className="mb-0">{t('settings.profile')}</h3>
        <p className="muted small">{t('settings.profileDesc')}</p>
        {isTutor ? (
          <a href={`/${lang}/tutor/profile`} className="btn btn-outline btn-sm">{t('settings.editTutor')}</a>
        ) : (
          <a href={`/${lang}/${s.roles.includes('parent') ? 'parent' : 'student'}`} className="btn btn-outline btn-sm">{t('nav.overview')}</a>
        )}
      </div>
    </DashboardShell>
  );
}
