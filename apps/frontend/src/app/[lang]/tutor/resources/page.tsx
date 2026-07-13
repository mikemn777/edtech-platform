'use client';

import { useEffect, useRef, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { tutorNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { listMyResources, uploadResource, deleteResource, downloadResource, fileToBase64, type ResourceRow } from '@/lib/resources';
import { Folder, FileText } from '@/components/icons';

const MAX_BYTES = 10 * 1024 * 1024; // matches the backend's ~10MB base64 cap

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TutorResources({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const session = useSession();
  const fileInput = useRef<HTMLInputElement>(null);

  const [rows, setRows] = useState<ResourceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function reload() {
    setRows(await listMyResources().catch(() => []));
  }

  useEffect(() => {
    if (session.loading || !session.authenticated) return;
    reload().finally(() => setLoading(false));
  }, [session.loading, session.authenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  async function upload() {
    if (!file || !title.trim()) return;
    if (file.size > MAX_BYTES) { setErr(t('res.err.size')); return; }
    setBusy(true); setErr(null);
    try {
      const contentBase64 = await fileToBase64(file);
      await uploadResource({ title: title.trim(), description: description.trim() || undefined, contentBase64, contentType: file.type || 'application/octet-stream' });
      setTitle(''); setDescription(''); setFile(null);
      if (fileInput.current) fileInput.current.value = '';
      await reload();
    } catch { setErr(t('res.error')); } finally { setBusy(false); }
  }

  async function onDownload(r: ResourceRow) {
    try { await downloadResource(r.id, r.title); } catch { setErr(t('res.error')); }
  }

  async function remove(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
    await deleteResource(id).catch(() => reload());
  }

  return (
    <DashboardShell lang={lang} title={t('res.title')} nav={tutorNav(lang, t)} active={`/${lang}/tutor/resources`}>
      <h1 className="mb-0">{t('res.title')}</h1>
      <p className="muted">{t('res.subtitle')}</p>

      <div className="card mt-2" style={{ maxWidth: 640 }}>
        <h3>{t('res.upload')}</h3>
        {err && <div className="alert alert-danger mb-2">{err}</div>}
        <div className="field">
          <label className="label">{t('res.titleF')}</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('res.titleF.ph')} />
        </div>
        <div className="field">
          <label className="label">{t('res.descF')}</label>
          <textarea className="textarea" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('res.descF.ph')} />
        </div>
        <div className="field">
          <label className="label">{t('res.fileF')}</label>
          <input ref={fileInput} className="input" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <span className="soft small">{t('res.fileF.hint')}</span>
        </div>
        <button className="btn btn-primary" onClick={upload} disabled={busy || !file || !title.trim()}>
          {busy ? <span className="spinner" /> : t('res.uploadBtn')}
        </button>
      </div>

      <h3 className="mt-4">{t('res.list')}</h3>
      {loading ? (
        <div className="text-c muted mt-2"><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</div>
      ) : rows.length === 0 ? (
        <div className="card text-c card-pad-lg mt-2">
          <div className="brand-mark" style={{ width: 48, height: 48, marginInline: 'auto' }}><Folder /></div>
          <h3 className="mt-2">{t('res.empty.t')}</h3>
          <p className="muted mb-0">{t('res.empty.d')}</p>
        </div>
      ) : (
        <div className="stack gap-2 mt-2" style={{ maxWidth: 720 }}>
          {rows.map((r) => (
            <div className="card row between wrap gap-2" key={r.id} style={{ padding: '.9rem 1.2rem' }}>
              <span className="row gap-2">
                <span className="brand-mark" style={{ width: 34, height: 34 }}><FileText width={16} height={16} /></span>
                <span>
                  <strong>{r.title}</strong>
                  {r.description && <span className="muted small" style={{ display: 'block' }}>{r.description}</span>}
                  <span className="soft small">{r.contentType} · {formatSize(r.sizeBytes)}</span>
                </span>
              </span>
              <span className="row gap-2">
                <button className="btn btn-outline btn-sm" onClick={() => onDownload(r)}>{t('res.download')}</button>
                <button className="btn btn-ghost btn-sm" onClick={() => remove(r.id)}>{t('res.delete')}</button>
              </span>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
