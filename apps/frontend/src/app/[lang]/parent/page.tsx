'use client';

import DashboardShell from '@/components/DashboardShell';
import { parentNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { Users, Star, Calendar, ArrowRight } from '@/components/icons';

export default function ParentHome({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const s = useSession();

  return (
    <DashboardShell lang={lang} title={t('parent.title')} nav={parentNav(lang, t)} active={`/${lang}/parent`}>
      <h1 className="mb-0">{t('dash.welcome')}</h1>
      <p className="muted">{s.email}</p>

      <div className="grid cols-3 mt-2">
        <div className="card"><div className="stat"><span className="n">0</span><span className="l">{t('parent.stat.children')}</span></div></div>
        <div className="card"><div className="stat"><span className="n">0</span><span className="l">{t('parent.stat.upcoming')}</span></div></div>
        <div className="card"><div className="stat"><span className="n">0</span><span className="l">{t('parent.stat.tutors')}</span></div></div>
      </div>

      <h3 className="mt-4">{t('student.next')}</h3>
      <div className="grid cols-3 mt-2">
        <a href={`/${lang}/parent/children`} className="card card-hover">
          <div className="brand-mark" style={{ width: 40, height: 40 }}><Users /></div>
          <h3 className="mt-2">{t('parent.link.t')}</h3>
          <p className="muted small">{t('parent.link.d')}</p>
          <span className="row gap-1" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('common.open')} <ArrowRight width={15} height={15} /></span>
        </a>
        <a href={`/${lang}/tutors`} className="card card-hover">
          <div className="brand-mark" style={{ width: 40, height: 40 }}><Star /></div>
          <h3 className="mt-2">{t('student.find.t')}</h3>
          <p className="muted small">{t('parent.find.d')}</p>
          <span className="row gap-1" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('nav.tutors')} <ArrowRight width={15} height={15} /></span>
        </a>
        <a href={`/${lang}/parent/children`} className="card card-hover">
          <div className="brand-mark" style={{ width: 40, height: 40 }}><Calendar /></div>
          <h3 className="mt-2">{t('parent.monitor.t')}</h3>
          <p className="muted small">{t('parent.monitor.d')}</p>
          <span className="row gap-1" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('common.open')} <ArrowRight width={15} height={15} /></span>
        </a>
      </div>
    </DashboardShell>
  );
}