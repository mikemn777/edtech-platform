'use client';

import DashboardShell from '@/components/DashboardShell';
import { adminNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { useApiQuery } from '@/lib/useApi';
import { useSession } from '@/lib/session';
import type { PaginatedResult } from '@edu/types';
import { Users, Shield, Book, ArrowRight, Chart, Settings } from '@/components/icons';

export default function AdminHome({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const session = useSession();
  const users = useApiQuery<PaginatedResult<unknown>>('users?page=1&pageSize=1');

  const totalUsers = users.data?.meta.total ?? null;

  return (
    <DashboardShell lang={lang} title={t('admin.title')} nav={adminNav(lang, t)} active={`/${lang}/admin`}>
      <h1 className="mb-0">{t('dash.welcome')}</h1>
      <p className="muted">{t('admin.subtitle')}</p>

      <div className="grid cols-3 mt-3">
        <div className="card"><div className="stat"><span className="n">{totalUsers ?? (users.loading ? '—' : '0')}</span><span className="l">{t('admin.stat.users')}</span></div></div>
        <div className="card"><div className="stat"><span className="n">{session.permissions.length}</span><span className="l">{t('admin.stat.perms')}</span></div></div>
        <div className="card"><div className="stat"><span className="n">{session.roles.length}</span><span className="l">{t('admin.stat.roles')}</span></div></div>
      </div>

      <h3 className="mt-4">{t('admin.quick')}</h3>
      <div className="grid cols-3 mt-2">
        {[
          { href: `/${lang}/admin/users`, icon: <Users />, title: t('admin.users.title'), desc: t('admin.users.desc') },
          { href: `/${lang}/admin/verification`, icon: <Shield />, title: t('admin.verify.title'), desc: t('admin.verify.desc') },
          { href: `/${lang}/admin/content`, icon: <Book />, title: t('admin.content.title'), desc: t('admin.content.desc') },
          { href: `/${lang}/admin/analytics`, icon: <Chart />, title: t('nav.analytics'), desc: t('ana.subtitle') },
          { href: `/${lang}/settings`, icon: <Settings />, title: t('nav.settings'), desc: t('settings.subtitle') },
        ].map((c) => (
          <a href={c.href} className="card card-hover" key={c.href}>
            <div className="brand-mark" style={{ width: 40, height: 40 }}>{c.icon}</div>
            <h3 className="mt-2">{c.title}</h3>
            <p className="muted small">{c.desc}</p>
            <span className="row gap-1" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('common.open')} <ArrowRight width={15} height={15} /></span>
          </a>
        ))}
      </div>
    </DashboardShell>
  );
}