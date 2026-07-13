'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { tutorNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { listPublishedCourses, type Course } from '@/lib/courses';
import { issueCertificate, revokeCertificate, type CertificateRow } from '@/lib/certificates';
import { Award, Check } from '@/components/icons';

export default function TutorCertificates({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);

  const [courses, setCourses] = useState<Course[]>([]);
  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [issued, setIssued] = useState<CertificateRow[]>([]);

  useEffect(() => {
    listPublishedCourses().then(setCourses).catch(() => setCourses([]));
  }, []);

  async function issue() {
    if (!studentId.trim() || !title.trim() || !courseId) return;
    setBusy(true); setErr(null);
    try {
      const cert = await issueCertificate({ studentId: studentId.trim(), title: title.trim(), issuedForType: 'COURSE', issuedForId: courseId });
      setIssued((prev) => [cert, ...prev]);
      setStudentId(''); setTitle('');
    } catch { setErr(t('cert.t.error')); } finally { setBusy(false); }
  }

  async function revoke(id: string) {
    setBusy(true);
    try {
      const updated = await revokeCertificate(id);
      setIssued((prev) => prev.map((c) => c.id === id ? updated : c));
    } catch { setErr(t('cert.t.error')); } finally { setBusy(false); }
  }

  return (
    <DashboardShell lang={lang} title={t('cert.t.title')} nav={tutorNav(lang, t)} active={`/${lang}/tutor/certificates`}>
      <h1 className="mb-0">{t('cert.t.title')}</h1>
      <p className="muted">{t('cert.t.subtitle')}</p>

      <div className="card mt-2" style={{ maxWidth: 640 }}>
        <h3>{t('cert.t.issue')}</h3>
        {err && <div className="alert alert-danger mb-2">{err}</div>}
        <div className="field">
          <label className="label">{t('cert.f.student')}</label>
          <input className="input" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder={t('cert.f.student.ph')} />
          <span className="soft small">{t('cert.f.student.hint')}</span>
        </div>
        <div className="field">
          <label className="label">{t('cert.f.title')}</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('cert.f.title.ph')} />
        </div>
        <div className="field">
          <label className="label">{t('cert.f.course')}</label>
          <select className="input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">{t('cert.f.course.ph')}</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={issue} disabled={busy || !studentId.trim() || !title.trim() || !courseId}>
          {busy ? <span className="spinner" /> : t('cert.t.issueBtn')}
        </button>
      </div>

      {issued.length > 0 && (
        <>
          <h3 className="mt-4">{t('cert.t.recent')}</h3>
          <div className="stack gap-2 mt-2" style={{ maxWidth: 720 }}>
            {issued.map((c) => (
              <div className="card row between wrap gap-2" key={c.id} style={{ padding: '.9rem 1.2rem' }}>
                <span className="row gap-2">
                  <span className="brand-mark" style={{ width: 34, height: 34 }}><Award width={16} height={16} /></span>
                  <span>
                    <strong>{c.title}</strong>
                    <span className="soft small" style={{ display: 'block' }}>{c.serialNumber}</span>
                  </span>
                </span>
                {c.status === 'ISSUED' ? (
                  <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => revoke(c.id)}>{t('cert.t.revoke')}</button>
                ) : (
                  <span className="badge badge-danger"><Check width={13} height={13} /> {t('cert.t.revoked')}</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardShell>
  );
}
