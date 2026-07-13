'use client';

import { useEffect, useState } from 'react';
import DashboardShell, { type NavItem } from '@/components/DashboardShell';
import { adminNav, studentNav, parentNav, tutorNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { useSession, OPERATIONAL_ROLES } from '@/lib/session';
import { listNotes, createNote, updateNote, deleteNote, type NoteRow } from '@/lib/notes';
import { FileText, Check } from '@/components/icons';

function navForRoles(lang: string, t: (k: string) => string, roles: string[]): NavItem[] {
  if (roles.some((r) => OPERATIONAL_ROLES.includes(r))) return adminNav(lang, t);
  if (roles.includes('tutor')) return tutorNav(lang, t);
  if (roles.includes('parent')) return parentNav(lang, t);
  return studentNav(lang, t);
}

export default function NotesPage({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const session = useSession();

  const [rows, setRows] = useState<NoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');

  async function reload() {
    setRows(await listNotes().catch(() => []));
  }

  useEffect(() => {
    if (session.loading || !session.authenticated) return;
    reload().finally(() => setLoading(false));
  }, [session.loading, session.authenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  async function add() {
    if (!body.trim()) return;
    setBusy(true); setErr(null);
    try {
      await createNote({ title: title.trim() || undefined, body: body.trim() });
      setTitle(''); setBody('');
      await reload();
    } catch { setErr(t('notes.error')); } finally { setBusy(false); }
  }

  function startEdit(n: NoteRow) {
    setEditingId(n.id);
    setEditBody(n.body);
  }

  async function saveEdit(id: string) {
    if (!editBody.trim()) return;
    setBusy(true); setErr(null);
    try {
      await updateNote(id, { body: editBody.trim() });
      setEditingId(null);
      await reload();
    } catch { setErr(t('notes.error')); } finally { setBusy(false); }
  }

  async function remove(id: string) {
    setRows((prev) => prev.filter((n) => n.id !== id));
    await deleteNote(id).catch(() => reload());
  }

  return (
    <DashboardShell lang={lang} title={t('notes.title')} nav={navForRoles(lang, t, session.roles)} active={`/${lang}/notes`}>
      <h1 className="mb-0">{t('notes.title')}</h1>
      <p className="muted">{t('notes.subtitle')}</p>

      <div className="card mt-2" style={{ maxWidth: 640 }}>
        <h3>{t('notes.add')}</h3>
        {err && <div className="alert alert-danger mb-2">{err}</div>}
        <div className="field">
          <label className="label">{t('notes.titleF')}</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('notes.titleF.ph')} />
        </div>
        <div className="field">
          <label className="label">{t('notes.body')}</label>
          <textarea className="textarea" rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t('notes.body.ph')} />
        </div>
        <button className="btn btn-primary" onClick={add} disabled={busy || !body.trim()}>
          {busy ? <span className="spinner" /> : t('notes.addBtn')}
        </button>
      </div>

      <h3 className="mt-4">{t('notes.yours')}</h3>
      {loading ? (
        <div className="text-c muted mt-2"><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</div>
      ) : rows.length === 0 ? (
        <div className="card text-c card-pad-lg mt-2">
          <div className="brand-mark" style={{ width: 48, height: 48, marginInline: 'auto' }}><FileText /></div>
          <h3 className="mt-2">{t('notes.empty.t')}</h3>
          <p className="muted mb-0">{t('notes.empty.d')}</p>
        </div>
      ) : (
        <div className="stack gap-2 mt-2" style={{ maxWidth: 720 }}>
          {rows.map((n) => (
            <div className="card" key={n.id}>
              {editingId === n.id ? (
                <>
                  <textarea className="textarea" rows={3} value={editBody} onChange={(e) => setEditBody(e.target.value)} />
                  <div className="row gap-2 mt-2">
                    <button className="btn btn-primary btn-sm" onClick={() => saveEdit(n.id)} disabled={busy || !editBody.trim()}>
                      {busy ? <span className="spinner" /> : <><Check width={13} height={13} /> {t('notes.save')}</>}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>{t('notes.cancel')}</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="row between wrap gap-2">
                    {n.title && <strong>{n.title}</strong>}
                    <span className="soft small" style={{ marginInlineStart: 'auto' }}>{new Date(n.updatedAt).toLocaleDateString(lang === 'ar' ? 'ar' : lang === 'tr' ? 'tr' : 'en')}</span>
                  </div>
                  <p className="small mt-1 mb-0" style={{ whiteSpace: 'pre-wrap' }}>{n.body}</p>
                  <div className="row gap-2 mt-2">
                    <button className="btn btn-outline btn-sm" onClick={() => startEdit(n)}>{t('notes.edit')}</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => remove(n.id)}>{t('notes.delete')}</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
