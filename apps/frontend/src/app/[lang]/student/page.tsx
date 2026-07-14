'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { studentNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { ensureStudentProfileId } from '@/lib/booking';
import { Star, Calendar, Book, ArrowRight, Users, Check, Heart, Chart, FileText, Award, Settings } from '@/components/icons';

export default function StudentHome({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const s = useSession();
  const linkCode = s.claims?.sub ?? '';
  const [copied, setCopied] = useState(false);

  // Make sure this student has a profile row so a parent can link to them by code.
  useEffect(() => {
    if (s.loading || !s.authenticated) return;
    ensureStudentProfileId().catch(() => { /* non-blocking */ });
  }, [s.loading, s.authenticated]);

  const cards = [
    { href: `/${lang}/tutors`, icon: <Star />, title: t('student.find.t'), desc: t('student.find.d') },
    { href: `/${lang}/student/bookings`, icon: <Calendar />, title: t('student.book.t'), desc: t('student.book.d') },
    { href: `/${lang}/favorites`, icon: <Heart />, title: t('nav.favorites'), desc: t('fav.subtitle') },
    { href: `/${lang}/student/goals`, icon: <Check />, title: t('nav.goals'), desc: t('goals.subtitle') },
    { href: `/${lang}/student/courses`, icon: <Book />, title: t('student.learn.t'), desc: t('student.learn.d') },
    { href: `/${lang}/student/homework`, icon: <Check />, title: t('nav.homework'), desc: t('hw.s.subtitle') },
    { href: `/${lang}/student/quizzes`, icon: <Chart />, title: t('nav.quizzes'), desc: t('qz.s.subtitle') },
    { href: `/${lang}/student/certificates`, icon: <Award />, title: t('nav.certificates'), desc: t('cert.subtitle') },
    { href: `/${lang}/student/progress`, icon: <Chart />, title: t('nav.progress'), desc: t('progress.subtitle') },
    { href: `/${lang}/notes`, icon: <FileText />, title: t('nav.notes'), desc: t('notes.subtitle') },
    { href: `/${lang}/settings`, icon: <Settings />, title: t('nav.settings'), desc: t('settings.subtitle') },
  ];

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(linkCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — user can select the text manually */
    }
  }

  return (
    <DashboardShell lang={lang} title={t('student.title')} nav={studentNav(lang, t)} active={`/${lang}/student`}>
      <h1 className="mb-0">{t('dash.welcome')}</h1>
      <p className="muted">{s.email}</p>

      <div className="grid cols-3 mt-2">
        <div className="card"><div className="stat"><span className="n">0</span><span className="l">{t('student.stat.upcoming')}</span></div></div>
        <div className="card"><div className="stat"><span className="n">0</span><span className="l">{t('student.stat.courses')}</span></div></div>
        <div className="card"><div className="stat"><span className="n">0</span><span className="l">{t('student.stat.goals')}</span></div></div>
      </div>

      {linkCode && (
        <div className="card mt-4" style={{ maxWidth: 640 }}>
          <div className="row gap-2">
            <div className="brand-mark" style={{ width: 40, height: 40 }}><Users /></div>
            <div>
              <h3 className="mb-0">{t('kids.myCode.t')}</h3>
              <p className="muted small mb-0">{t('kids.myCode.d')}</p>
            </div>
          </div>
          <div className="row between wrap gap-2 mt-2">
            <code className="mono" style={{ background: 'var(--surface-2)', padding: '.55rem .8rem', borderRadius: 10, userSelect: 'all', wordBreak: 'break-all' }}>{linkCode}</code>
            <button className="btn btn-outline" onClick={copyCode}>
              {copied ? <><Check width={14} height={14} /> {t('kids.copied')}</> : t('kids.copy')}
            </button>
          </div>
        </div>
      )}

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
