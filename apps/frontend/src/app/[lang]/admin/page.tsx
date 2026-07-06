'use client';

import DashboardShell from '@/components/DashboardShell';
import { adminNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { useApiQuery } from '@/lib/useApi';
import { useSession } from '@/lib/session';
import type { PaginatedResult } from '@edu/types';
import { Users, Shield, Book, ArrowRight } from '@/components/icons';

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
        <a href={`/${lang}/admin/users`} className="card card-hover">
          <div className="brand-mark" style={{ width: 40, height: 40 }}><Users /></div>
          <h3 className="mt-2">{t('admin.users.title')}</h3>
          <p className="muted small">{t('admin.users.desc')}</p>
          <span className="row gap-1" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('common.open')} <ArrowRight width={15} height={15} /></span>
        </a>
        <a href={`/${lang}/admin/verification`} className="card card-hover">
          <div className="brand-mark" style={{ width: 40, height: 40 }}><Shield /></div>
          <h3 className="mt-2">{t('admin.verify.title')}</h3>
          <p className="muted small">{t('admin.verify.desc')}</p>
          <span className="row gap-1" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('common.open')} <ArrowRight width={15} height={15} /></span>
        </a>
        <a href={`/${lang}/admin/content`} className="card card-hover">
          <div className="brand-mark" style={{ width: 40, height: 40 }}><Book /></div>
          <h3 className="mt-2">{t('admin.content.title')}</h3>
          <p className="muted small">{t('admin.content.desc')}</p>
          <span className="row gap-1" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('common.open')} <ArrowRight width={15} height={15} /></span>
        </a>
      </div>
    </DashboardShell>
  );
}