'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { parentNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { listGuardianships, linkChild, monitorChild, type GuardianshipRow, type MonitorSummary } from '@/lib/parent';
import { Users, Check } from '@/components/icons';

interface Row extends GuardianshipRow { monitor?: MonitorSummary | null }

export default function ParentChildren({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const session = useSession();
  const parentId = session.claims?.sub ?? null;

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [childId, setChildId] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function reload(pid: string) {
    const links = await listGuardianships(pid).catch(() => [] as GuardianshipRow[]);
    const withMonitor: Row[] = await Promise.all(links.map(async (l) => ({
      ...l,
      monitor: l.status === 'active' ? await monitorChild(pid, l.studentAccountId).catch(() => null) : null,
    })));
    setRows(withMonitor);
  }

  useEffect(() => {
    if (session.loading || !parentId) return;
    reload(parentId).finally(() => setLoading(false));
  }, [session.loading, parentId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onLink() {
    if (!parentId || !childId.trim()) return;
    setErr(null); setBusy(true); setDone(false);
    try {
      await linkChild(parentId, childId.trim());
      setChildId(''); setDone(true);
      await reload(parentId);
    } catch { setErr(t('kids.error')); } finally { setBusy(false); }
  }

  return (
    <DashboardShell lang={lang} title={t('nav.children')} nav={parentNav(lang, t)} active={`/${lang}/parent/children`}>
      <h1 className="mb-0">{t('nav.children')}</h1>
      <p className="muted">{t('kids.subtitle')}</p>

      <div className="card mt-2" style={{ maxWidth: 640 }}>
        <h3>{t('parent.link.t')}</h3>
        {err && <div className="alert alert-danger mb-2">{err}</div>}
        <div className="field">
          <label className="label">{t('kids.childId')}</label>
          <input className="input mono" value={childId} onChange={(e) => setChildId(e.target.value)} placeholder="xxxxxxxx-xxxx-…" />
          <div className="hint">{t('kids.childId.hint')}</div>
        </div>
        <div className="row gap-2">
          <button className="btn btn-primary" disabled={busy || !childId.trim()} onClick={onLink}>{busy ? <span className="spinner" /> : t('kids.linkBtn')}</button>
          {done && <span className="badge badge-ok"><Check width={13} height={13} /> {t('kids.linked')}</span>}
        </div>
      </div>

      <h3 className="mt-4">{t('kids.list')} ({rows.length})</h3>
      {loading ? (
        <div className="text-c muted mt-2"><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</div>
      ) : rows.length === 0 ? (
        <div className="card text-c card-pad-lg mt-2">
          <div className="brand-mark" style={{ width: 48, height: 48, marginInline: 'auto' }}><Users /></div>
          <h3 className="mt-2">{t('kids.empty.t')}</h3>
          <p className="muted mb-0">{t('kids.empty.d')}</p>
        </div>
      ) : (
        <div className="stack gap-2 mt-2" style={{ maxWidth: 760 }}>
          {rows.map((r) => (
            <div className="card" key={r.id}>
              <div className="row between wrap gap-2">
                <div className="row gap-2">
                  <div className="avatar"><Users width={18} height={18} /></div>
                  <div>
                    <strong className="mono small">{r.studentAccountId.slice(0, 8)}…</strong>
                    <div className="soft small">{new Date(r.establishedAt).toLocaleDateString(lang === 'ar' ? 'ar' : lang === 'tr' ? 'tr' : 'en')}</div>
                  </div>
                </div>
                <span className={`badge ${r.status === 'active' ? 'badge-ok' : 'badge-warn'}`}>{r.status === 'active' ? t('kids.active') : t('kids.pending')}</span>
              </div>
              {r.monitor && (
                <div className="grid cols-3 mt-2">
                  <div className="card" style={{ padding: '.9rem' }}><div className="stat"><span className="n">{r.monitor.summary.activeGoals}</span><span className="l">{t('progress.stat.activeGoals')}</span></div></div>
                  <div className="card" style={{ padding: '.9rem' }}><div className="stat"><span className="n">{r.monitor.summary.progressEntries}</span><span className="l">{t('kids.progressEntries')}</span></div></div>
                  <div className="card" style={{ padding: '.9rem' }}><div className="stat"><span className="n">{r.monitor.summary.upcomingBookings}</span><span className="l">{t('student.stat.upcoming')}</span></div></div>
                </div>
              )}
              {r.status !== 'active' && <p className="soft small mt-2 mb-0">{t('kids.pendingNote')}</p>}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
