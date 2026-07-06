'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { tutorNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import {
  getMyTutorProfile, createMyTutorProfile, updateTutorProfile,
  listSubjects, addSubject, removeSubject,
  type MyTutorProfile, type SubjectRow,
} from '@/lib/tutorSelf';
import { Check, Shield } from '@/components/icons';

export default function TutorProfileEditor({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);

  const [profile, setProfile] = useState<MyTutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const p = await getMyTutorProfile();
        if (p) {
          setProfile(p); setHeadline(p.headline ?? ''); setBio(p.bio ?? '');
          setSubjects(await listSubjects(p.id).catch(() => []));
        }
      } finally { setLoading(false); }
    })();
  }, []);

  async function saveProfile() {
    setSaving(true); setSaved(false);
    try {
      if (!profile) {
        const created = await createMyTutorProfile(headline, bio);
        setProfile(created);
        setSubjects(await listSubjects(created.id).catch(() => []));
      } else {
        await updateTutorProfile(profile.id, { headline, bio });
      }
      setSaved(true);
    } finally { setSaving(false); }
  }

  async function onAddSubject() {
    if (!profile || !newSubject.trim()) return;
    await addSubject(profile.id, newSubject).catch(() => {});
    setNewSubject('');
    setSubjects(await listSubjects(profile.id).catch(() => subjects));
  }
  async function onRemoveSubject(id: string) {
    if (!profile) return;
    setSubjects((s) => s.filter((x) => x.id !== id));
    await removeSubject(profile.id, id).catch(() => {});
  }

  const verified = profile?.verificationStatus === 'VERIFIED';

  return (
    <DashboardShell lang={lang} title={t('tutorEdit.title')} nav={tutorNav(lang, t)} active={`/${lang}/tutor/profile`}>
      <h1 className="mb-0">{t('tutorEdit.title')}</h1>
      <p className="muted">{t('tutorEdit.subtitle')}</p>

      {loading ? (
        <div className="text-c muted mt-3"><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</div>
      ) : (
        <>
          {profile && (
            <div className="card mt-2" style={{ borderColor: verified ? 'var(--ok-500)' : 'var(--warn-500)', background: verified ? 'rgba(16,185,129,.06)' : 'rgba(245,158,11,.06)' }}>
              <div className="row gap-2">
                <span className="brand-mark" style={{ width: 38, height: 38, background: verified ? 'var(--ok-500)' : 'var(--warn-500)' }}><Shield /></span>
                <div>
                  <strong>{verified ? t('tutorEdit.verified') : t('tutorEdit.unverified')}</strong>
                  <p className="muted small mb-0">{verified ? t('tutorEdit.verifiedD') : t('tutorEdit.unverifiedD')}</p>
                </div>
              </div>
            </div>
          )}

          <div className="card mt-3" style={{ maxWidth: 680 }}>
            <div className="field">
              <label className="label">{t('tutorEdit.headline')}</label>
              <input className="input" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder={t('tutorEdit.headline.ph')} />
            </div>
            <div className="field">
              <label className="label">{t('tutorEdit.bio')}</label>
              <textarea className="textarea" rows={5} value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t('tutorEdit.bio.ph')} />
            </div>
            <div className="row gap-2">
              <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
                {saving ? <span className="spinner" /> : (profile ? t('tutorEdit.save') : t('tutorEdit.create'))}
              </button>
              {saved && <span className="badge badge-ok"><Check width={13} height={13} /> {t('tutorEdit.saved')}</span>}
            </div>
          </div>

          {profile && (
            <div className="card mt-3" style={{ maxWidth: 680 }}>
              <h3>{t('tutorEdit.subjects')}</h3>
              <div className="row wrap gap-1 mb-2">
                {subjects.length === 0 && <span className="muted small">{t('tutorEdit.noSubjects')}</span>}
                {subjects.map((s) => (
                  <span key={s.id} className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                    {s.subject}
                    <button onClick={() => onRemoveSubject(s.id)} aria-label={t('common.open')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', marginInlineStart: 4 }}>×</button>
                  </span>
                ))}
              </div>
              <div className="row gap-1">
                <input className="input" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder={t('tutorEdit.addSubject.ph')} onKeyDown={(e) => { if (e.key === 'Enter') onAddSubject(); }} />
                <button className="btn btn-outline" onClick={onAddSubject}>{t('tutorEdit.add')}</button>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}