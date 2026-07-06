'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { adminNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { listPublishedCourses, type Course } from '@/lib/courses';
import { createCourse, setCourseStatus } from '@/lib/adminOps';
import { Book, Check } from '@/components/icons';

export default function AdminContent({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function reload() { setCourses(await listPublishedCourses().catch(() => [])); }
  useEffect(() => { reload().finally(() => setLoading(false)); }, []);

  async function onCreate() {
    if (!title.trim() || !subject.trim()) return;
    setErr(null); setBusy(true); setDone(false);
    try {
      const c = await createCourse({ title: title.trim(), subject: subject.trim().toLowerCase(), description: description.trim() || undefined });
      await setCourseStatus(c.id, 'PUBLISHED');
      setTitle(''); setSubject(''); setDescription(''); setDone(true);
      await reload();
    } catch { setErr(t('cc.error')); } finally { setBusy(false); }
  }

  async function retire(id: string) {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    await setCourseStatus(id, 'RETIRED').catch(() => {});
  }

  return (
    <DashboardShell lang={lang} title={t('admin.content.title')} nav={adminNav(lang, t)} active={`/${lang}/admin/content`}>
      <h1 className="mb-0">{t('admin.content.title')}</h1>
      <p className="muted">{t('cc.subtitle')}</p>

      <div className="card mt-2" style={{ maxWidth: 640 }}>
        <h3>{t('cc.create')}</h3>
        {err && <div className="alert alert-danger mb-2">{err}</div>}
        <div className="field"><label className="label">{t('cc.titleF')}</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="field"><label className="label">{t('cc.subjectF')}</label><input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="mathematics" /></div>
        <div className="field"><label className="label">{t('cc.descF')}</label><textarea className="textarea" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        <div className="row gap-2">
          <button className="btn btn-primary" disabled={busy || !title.trim() || !subject.trim()} onClick={onCreate}>{busy ? <span className="spinner" /> : t('cc.createBtn')}</button>
          {done && <span className="badge badge-ok"><Check width={13} height={13} /> {t('cc.created')}</span>}
        </div>
      </div>

      <h3 className="mt-4">{t('cc.list')} ({courses.length})</h3>
      {loading ? (
        <div className="text-c muted mt-2"><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</div>
      ) : (
        <div className="grid cols-3 mt-2">
          {courses.map((c) => (
            <div key={c.id} className="card">
              <div className="brand-mark" style={{ width: 40, height: 40 }}><Book /></div>
              <h3 className="mt-2">{c.title}</h3>
              <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{c.subject}</span>
              {c.description && <p className="muted small mt-2">{c.description}</p>}
              <button className="btn btn-outline btn-sm" onClick={() => retire(c.id)}>{t('cc.retire')}</button>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
