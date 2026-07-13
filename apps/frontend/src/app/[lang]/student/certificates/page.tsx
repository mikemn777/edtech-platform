'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { studentNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { ensureStudentProfileId } from '@/lib/booking';
import { listCertificatesForStudent, verifyCertificate, type CertificateRow } from '@/lib/certificates';
import { Award, Check } from '@/components/icons';

export default function StudentCertificates({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);

  const [rows, setRows] = useState<CertificateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verified, setVerified] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const sid = await ensureStudentProfileId();
        setRows(await listCertificatesForStudent(sid).catch(() => []));
      } catch { setErr(t('cert.error')); } finally { setLoading(false); }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function checkVerify(serial: string) {
    setVerifying(serial);
    try {
      const r = await verifyCertificate(serial);
      setVerified((v) => ({ ...v, [serial]: r.valid }));
    } catch {
      setVerified((v) => ({ ...v, [serial]: false }));
    } finally { setVerifying(null); }
  }

  return (
    <DashboardShell lang={lang} title={t('cert.title')} nav={studentNav(lang, t)} active={`/${lang}/student/certificates`}>
      <h1 className="mb-0">{t('cert.title')}</h1>
      <p className="muted">{t('cert.subtitle')}</p>
      {err && <div className="alert alert-danger mb-2" style={{ maxWidth: 720 }}>{err}</div>}

      {loading ? (
        <div className="text-c muted mt-3"><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</div>
      ) : rows.length === 0 ? (
        <div className="card text-c card-pad-lg mt-2" style={{ maxWidth: 720 }}>
          <div className="brand-mark" style={{ width: 48, height: 48, marginInline: 'auto' }}><Award /></div>
          <h3 className="mt-2">{t('cert.empty.t')}</h3>
          <p className="muted mb-0">{t('cert.empty.d')}</p>
        </div>
      ) : (
        <div className="grid cols-2 mt-2" style={{ maxWidth: 820 }}>
          {rows.map((c) => (
            <div className="card" key={c.id}>
              <div className="row gap-2">
                <span className="brand-mark" style={{ width: 40, height: 40 }}><Award width={20} height={20} /></span>
                <div>
                  <strong>{c.title}</strong>
                  <div className="soft small">{new Date(c.issuedAt).toLocaleDateString(lang === 'ar' ? 'ar' : lang === 'tr' ? 'tr' : 'en')}</div>
                </div>
                <span className={`badge ${c.status === 'ISSUED' ? 'badge-ok' : 'badge-danger'}`} style={{ marginInlineStart: 'auto' }}>
                  {t(`cert.status.${c.status}`)}
                </span>
              </div>
              <div className="divider" />
              <div className="row between wrap gap-2">
                <code className="mono small" style={{ background: 'var(--surface-2)', padding: '.3rem .55rem', borderRadius: 8, userSelect: 'all' }}>{c.serialNumber}</code>
                {verified[c.serialNumber] === undefined ? (
                  <button className="btn btn-outline btn-sm" disabled={verifying === c.serialNumber} onClick={() => checkVerify(c.serialNumber)}>
                    {verifying === c.serialNumber ? <span className="spinner" /> : t('cert.verify')}
                  </button>
                ) : verified[c.serialNumber] ? (
                  <span className="badge badge-ok"><Check width={13} height={13} /> {t('cert.verified')}</span>
                ) : (
                  <span className="badge badge-danger">{t('cert.notVerified')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
