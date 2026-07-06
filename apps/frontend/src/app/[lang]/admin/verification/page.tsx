'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { adminNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { listVerificationQueue, decideTutor, revokeTutor, type QueueRow } from '@/lib/adminOps';
import { Shield, Check } from '@/components/icons';

function badge(s: string): string {
  if (s === 'VERIFIED') return 'badge-ok';
  if (s === 'REVOKED') return 'badge-danger';
  return 'badge-warn';
}

export default function AdminVerification({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function reload() {
    setRows(await listVerificationQueue().catch(() => { setErr(t('ver.error')); return []; }));
  }
  useEffect(() => { reload().finally(() => setLoading(false)); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function act(row: QueueRow, action: 'APPROVED' | 'REJECTED' | 'REVOKE') {
    setErr(null); setBusyId(row.id);
    try {
      if (action === 'REVOKE') await revokeTutor(row.id);
      else await decideTutor(row.id, row.openCaseId, action);
      await reload();
    } catch { setErr(t('ver.error')); } finally { setBusyId(null); }
  }

  const pending = rows.filter((r) => r.verificationStatus !== 'VERIFIED').length;

  return (
    <DashboardShell lang={lang} title={t('admin.verify.title')} nav={adminNav(lang, t)} active={`/${lang}/admin/verification`}>
      <div className="row between wrap gap-2">
        <div>
          <h1 className="mb-0">{t('admin.verify.title')}</h1>
          <p className="muted mt-0">{t('ver.subtitle')}</p>
        </div>
        {pending > 0 && <span className="badge badge-warn"><Shield width={13} height={13} /> {pending} {t('ver.pending')}</span>}
      </div>
      {err && <div className="alert alert-danger mt-2">{err}</div>}

      {loading ? (
        <div className="text-c muted mt-3"><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</div>
      ) : rows.length === 0 ? (
        <div className="card text-c card-pad-lg mt-3">
          <div className="brand-mark" style={{ width: 48, height: 48, marginInline: 'auto' }}><Shield /></div>
          <h3 className="mt-2">{t('ver.empty')}</h3>
        </div>
      ) : (
        <div className="stack gap-2 mt-3" style={{ maxWidth: 820 }}>
          {rows.map((r) => {
            const name = r.displayName || r.headline || t('tutors.tutor');
            const busy = busyId === r.id;
            return (
              <div className="card" key={r.id}>
                <div className="row between wrap gap-2">
                  <div className="row gap-2">
                    <div className="avatar">{name.slice(0, 2).toUpperCase()}</div>
                    <div>
                      <strong>{name}</strong>
                      {r.headline && <div className="muted small">{r.headline}</div>}
                    </div>
                  </div>
                  <div className="row gap-2 wrap">
                    <span className={`badge ${badge(r.verificationStatus)}`}>{t(`ver.status.${r.verificationStatus}`)}</span>
                    {r.verificationStatus !== 'VERIFIED' && (
                      <>
                        <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => act(r, 'APPROVED')}>
                          {busy ? <span className="spinner" /> : <><Check width={14} height={14} /> {t('ver.approve')}</>}
                        </button>
                        <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => act(r, 'REJECTED')}>{t('ver.reject')}</button>
                      </>
                    )}
                    {r.verificationStatus === 'VERIFIED' && (
                      <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => act(r, 'REVOKE')}>{t('ver.revoke')}</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
