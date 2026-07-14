'use client';

import DashboardShell from '@/components/DashboardShell';
import { tutorNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { User, Calendar, Shield, ArrowRight, Bell, Check, Chart, Folder, Award, FileText, Settings } from '@/components/icons';

export default function TutorHome({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const s = useSession();

  const cards = [
    { href: `/${lang}/tutor/profile`, icon: <User />, title: t('tutor.profile.t'), desc: t('tutor.profile.d') },
    { href: `/${lang}/tutor/availability`, icon: <Calendar />, title: t('tutor.avail.t'), desc: t('tutor.avail.d') },
    { href: `/${lang}/tutor/bookings`, icon: <Bell />, title: t('nav.bookings'), desc: t('tbook.subtitle') },
    { href: `/${lang}/tutor/homework`, icon: <Check />, title: t('nav.homework'), desc: t('hw.t.subtitle') },
    { href: `/${lang}/tutor/quizzes`, icon: <Chart />, title: t('nav.quizzes'), desc: t('qz.t.subtitle') },
    { href: `/${lang}/tutor/resources`, icon: <Folder />, title: t('nav.resources'), desc: t('res.subtitle') },
    { href: `/${lang}/tutor/certificates`, icon: <Award />, title: t('nav.certificates'), desc: t('cert.t.subtitle') },
    { href: `/${lang}/notes`, icon: <FileText />, title: t('nav.notes'), desc: t('notes.subtitle') },
    { href: `/${lang}/settings`, icon: <Settings />, title: t('nav.settings'), desc: t('settings.subtitle') },
  ];

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
      <div className="grid cols-3 mt-2">
        {cards.map((c) => (
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