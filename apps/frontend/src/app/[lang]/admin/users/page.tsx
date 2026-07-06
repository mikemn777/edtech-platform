'use client';

import { useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { adminNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { useApiQuery } from '@/lib/useApi';
import type { PaginatedResult } from '@edu/types';

interface AccountRow {
  id: string;
  displayName: string;
  status: string;
  createdAt: string;
}

export default function AdminUsers({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { data, error, loading } = useApiQuery<PaginatedResult<AccountRow>>(
    `users?page=${page}&pageSize=${pageSize}`,
    [page],
  );

  const rows = data?.data ?? [];
  const meta = data?.meta;

  function statusBadge(s: string) {
    const cls = s === 'active' ? 'badge-ok' : s === 'suspended' ? 'badge-danger' : 'badge-neutral';
    return <span className={`badge ${cls}`}>{s}</span>;
  }

  return (
    <DashboardShell lang={lang} title={t('admin.users.title')} nav={adminNav(lang, t)} active={`/${lang}/admin/users`}>
      <div className="row between wrap gap-2">
        <div>
          <h1 className="mb-0">{t('admin.users.title')}</h1>
          <p className="muted mt-0">{t('admin.users.desc')}</p>
        </div>
        {meta && <span className="badge badge-neutral">{meta.total} {t('admin.users.total')}</span>}
      </div>

      <div className="card card-flush mt-3" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
          <thead>
            <tr style={{ textAlign: 'start', background: 'var(--surface-2)' }}>
              <th style={thStyle}>{t('admin.users.name')}</th>
              <th style={thStyle}>{t('admin.users.status')}</th>
              <th style={thStyle}>{t('admin.users.created')}</th>
              <th style={thStyle}>ID</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4} style={tdStyle}><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</td></tr>
            )}
            {error && !loading && (
              <tr><td colSpan={4} style={tdStyle}><span className="alert alert-danger" style={{ display: 'inline-block' }}>{error}</span></td></tr>
            )}
            {!loading && !error && rows.length === 0 && (
              <tr><td colSpan={4} style={tdStyle}><span className="muted">{t('admin.users.empty')}</span></td></tr>
            )}
            {rows.map((u) => (
              <tr key={u.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={tdStyle}>
                  <div className="row gap-2">
                    <div className="avatar" style={{ width: 32, height: 32, fontSize: '.8rem' }}>{u.displayName.slice(0, 2).toUpperCase()}</div>
                    <strong>{u.displayName}</strong>
                  </div>
                </td>
                <td style={tdStyle}>{statusBadge(u.status)}</td>
                <td style={tdStyle} className="muted small">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={tdStyle} className="soft small mono">{u.id.slice(0, 8)}…</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="row between mt-3">
          <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>{t('common.prev')}</button>
          <span className="muted small">{t('common.page')} {meta.page} / {meta.totalPages}</span>
          <button className="btn btn-outline btn-sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>{t('common.next')}</button>
        </div>
      )}
    </DashboardShell>
  );
}

const thStyle: React.CSSProperties = { textAlign: 'start', padding: '.75rem 1rem', fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-soft)', fontWeight: 700 };
const tdStyle: React.CSSProperties = { padding: '.75rem 1rem', verticalAlign: 'middle' };