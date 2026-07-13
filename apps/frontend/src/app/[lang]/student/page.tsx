'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { studentNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { ensureStudentProfileId } from '@/lib/booking';
import { Star, Calendar, Book, ArrowRight, Users, Check } from '@/components/icons';

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
        <a href={`/${lang}/tutors`} className="card card-hover">
          <div className="brand-mark" style={{ width: 40, height: 40 }}><Star /></div>
          <h3 className="mt-2">{t('student.find.t')}</h3>
          <p className="muted small">{t('student.find.d')}</p>
          <span className="row gap-1" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('nav.tutors')} <ArrowRight width={15} height={15} /></span>
        </a>
        <a href={`/${lang}/student/bookings`} className="card card-hover">
          <div className="brand-mark" style={{ width: 40, height: 40 }}><Calendar /></div>
          <h3 className="mt-2">{t('student.book.t')}</h3>
          <p className="muted small">{t('student.book.d')}</p>
          <span className="row gap-1" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('common.open')} <ArrowRight width={15} height={15} /></span>
        </a>
        <a href={`/${lang}/student/courses`} className="card card-hover">
          <div className="brand-mark" style={{ width: 40, height: 40 }}><Book /></div>
          <h3 className="mt-2">{t('student.learn.t')}</h3>
          <p className="muted small">{t('student.learn.d')}</p>
          <span className="row gap-1" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('common.open')} <ArrowRight width={15} height={15} /></span>
        </a>
      </div>
    </DashboardShell>
  );
}
