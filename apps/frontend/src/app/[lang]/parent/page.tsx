'use client';

import DashboardShell from '@/components/DashboardShell';
import { parentNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { Users, Star, Calendar, ArrowRight, Heart, FileText, Settings } from '@/components/icons';

export default function ParentHome({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const s = useSession();

  const cards = [
    { href: `/${lang}/parent/children`, icon: <Users />, title: t('parent.link.t'), desc: t('parent.link.d') },
    { href: `/${lang}/tutors`, icon: <Star />, title: t('student.find.t'), desc: t('parent.find.d') },
    { href: `/${lang}/parent/children`, icon: <Calendar />, title: t('parent.monitor.t'), desc: t('parent.monitor.d') },
    { href: `/${lang}/favorites`, icon: <Heart />, title: t('nav.favorites'), desc: t('fav.subtitle') },
    { href: `/${lang}/notes`, icon: <FileText />, title: t('nav.notes'), desc: t('notes.subtitle') },
    { href: `/${lang}/settings`, icon: <Settings />, title: t('nav.settings'), desc: t('settings.subtitle') },
  ];

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
        {cards.map((c, i) => (
          <a href={c.href} className="card card-hover" key={`${c.href}-${i}`}>
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