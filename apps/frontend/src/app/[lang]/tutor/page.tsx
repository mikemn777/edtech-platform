'use client';

import DashboardShell from '@/components/DashboardShell';
import { tutorNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { User, Calendar, Shield, ArrowRight } from '@/components/icons';

export default function TutorHome({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const s = useSession();

  return (
    <DashboardShell lang={lang} title={t('tutor.title')} nav={tutorNav(lang, t)} active={`/${lang}/tutor`}>
      <h1 className="mb-0">{t('dash.welcome')}</h1>
      <p className="muted">{s.email}</p>

      <div className="card mt-2" style={{ borderColor: 'var(--warn-500)', background: 'rgba(245,158,11,.06)' }}>
        <div className="row gap-2">
          <span className="brand-mark" style={{ width: 40, height: 40, background: 'var(--warn-500)' }}><Shield /></span>
          <div>
            <strong>{t('tutor.verify.t')}</strong>
            <p className="muted small mb-0">{t('tutor.verify.d')}</p>
          </div>
        </div>
      </div>

      <div className="grid cols-3 mt-2">
        <div className="card"><div className="stat"><span className="n">0</span><span className="l">{t('tutor.stat.bookings')}</span></div></div>
        <div className="card"><div className="stat"><span className="n">0</span><span className="l">{t('tutor.stat.students')}</span></div></div>
        <div className="card"><div className="stat"><span className="n">—</span><span className="l">{t('tutor.stat.rating')}</span></div></div>
      </div>

      <h3 className="mt-4">{t('student.next')}</h3>
      <div className="grid cols-2 mt-2">
        <a href={`/${lang}/tutor/profile`} className="card card-hover">
          <div className="brand-mark" style={{ width: 40, height: 40 }}><User /></div>
          <h3 className="mt-2">{t('tutor.profile.t')}</h3>
          <p className="muted small">{t('tutor.profile.d')}</p>
          <span className="row gap-1" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('common.open')} <ArrowRight width={15} height={15} /></span>
        </a>
        <a href={`/${lang}/tutor/availability`} className="card card-hover">
          <div className="brand-mark" style={{ width: 40, height: 40 }}><Calendar /></div>
          <h3 className="mt-2">{t('tutor.avail.t')}</h3>
          <p className="muted small">{t('tutor.avail.d')}</p>
          <span className="row gap-1" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('common.open')} <ArrowRight width={15} height={15} /></span>
        </a>
      </div>
    </DashboardShell>
  );
}