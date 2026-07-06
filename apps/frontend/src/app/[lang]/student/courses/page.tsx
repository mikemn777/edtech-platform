'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { studentNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { ensureStudentProfileId } from '@/lib/booking';
import { listPublishedCourses, listEnrollments, enroll, type Course, type EnrollmentRow } from '@/lib/courses';
import { Book, Check } from '@/components/icons';

export default function StudentCourses({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);

  const [studentId, setStudentId] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [cs, sid] = await Promise.all([
          listPublishedCourses().catch(() => [] as Course[]),
          ensureStudentProfileId().catch(() => null),
        ]);
        setCourses(cs);
        if (sid) {
          setStudentId(sid);
          setEnrollments(await listEnrollments(sid).catch(() => []));
        }
      } finally { setLoading(false); }
    })();
  }, []);

  const enrolledIds = new Set(enrollments.filter((e) => e.status === 'ACTIVE' || e.status === 'COMPLETED').map((e) => e.enrollableId));
  const myCourses = courses.filter((c) => enrolledIds.has(c.id));
  const catalog = courses.filter((c) => !enrolledIds.has(c.id));

  async function onEnroll(courseId: string) {
    if (!studentId) return;
    setErr(null); setBusyId(courseId);
    try {
      await enroll(studentId, courseId);
      setEnrollments(await listEnrollments(studentId));
    } catch { setErr(t('mycourses.error')); } finally { setBusyId(null); }
  }

  return (
    <DashboardShell lang={lang} title={t('mycourses.title')} nav={studentNav(lang, t)} active={`/${lang}/student/courses`}>
      <h1 className="mb-0">{t('mycourses.title')}</h1>
      <p className="muted">{t('mycourses.subtitle')}</p>
      {err && <div className="alert alert-danger mt-2">{err}</div>}

      {loading ? (
        <div className="text-c muted mt-3"><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</div>
      ) : (
        <>
          <h3 className="mt-3">{t('mycourses.enrolled')} ({myCourses.length})</h3>
          {myCourses.length === 0 ? (
            <div className="card text-c card-pad-lg mt-2">
              <div className="brand-mark" style={{ width: 48, height: 48, marginInline: 'auto' }}><Book /></div>
              <h3 className="mt-2">{t('mycourses.empty.t')}</h3>
              <p className="muted mb-0">{t('mycourses.empty.d')}</p>
            </div>
          ) : (
            <div className="grid cols-3 mt-2">
              {myCourses.map((c) => (
                <div key={c.id} className="card card-hover">
                  <div className="row between">
                    <div className="brand-mark" style={{ width: 40, height: 40 }}><Book /></div>
                    <span className="badge badge-ok"><Check width={12} height={12} /> {t('mycourses.enrolledBadge')}</span>
                  </div>
                  <h3 className="mt-2">{c.title}</h3>
                  <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{c.subject}</span>
                  {c.description && <p className="muted small mt-2 mb-0">{c.description}</p>}
                </div>
              ))}
            </div>
          )}

          <h3 className="mt-4">{t('mycourses.catalog')}</h3>
          {catalog.length === 0 ? (
            <p className="muted">{t('mycourses.catalogEmpty')}</p>
          ) : (
            <div className="grid cols-3 mt-2">
              {catalog.map((c) => (
                <div key={c.id} className="card card-hover">
                  <div className="brand-mark" style={{ width: 40, height: 40 }}><Book /></div>
                  <h3 className="mt-2">{c.title}</h3>
                  <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{c.subject}</span>
                  {c.description && <p className="muted small mt-2">{c.description}</p>}
                  <button className="btn btn-primary btn-block" disabled={busyId === c.id} onClick={() => onEnroll(c.id)}>
                    {busyId === c.id ? <span className="spinner" /> : t('mycourses.enroll')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}
