'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import { decodeClaims, getAccessToken } from '@/lib/auth';
import { homePathForRoles } from '@/lib/session';
import { ApiError } from '@/lib/api-client';
import { getTranslator } from '@/lib/i18n';
import AuthShell from '@/components/AuthShell';

export default function LoginPage({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const router = useRouter();
  const [email, setEmail] = useState('admin@edu.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      const token = getAccessToken();
      const roles = token ? decodeClaims(token)?.roles ?? [] : [];
      router.push(homePathForRoles(lang, roles));
    } catch (err) {
      if (err instanceof ApiError) setError(err.body?.error?.message ?? t('auth.login.failed'));
      else setError(t('auth.network'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell lang={lang} title={t('auth.signin.title')} subtitle={t('auth.signin.subtitle')}>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label className="label">{t('auth.email')}</label>
          <input className="input" type="email" value={email} autoComplete="username" required onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">{t('auth.password')}</label>
          <input className="input" type="password" value={password} autoComplete="current-password" required onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div className="alert alert-danger mb-2">{error}</div>}
        <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : t('auth.signin.action')}
        </button>
      </form>
      <p className="text-c muted small mt-3">
        {t('auth.noAccount')} <a href={`/${lang}/register`} style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('cta.getStarted')}</a>
      </p>
    </AuthShell>
  );
}