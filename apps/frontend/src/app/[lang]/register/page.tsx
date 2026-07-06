'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/auth';
import { getAccessToken, decodeClaims } from '@/lib/auth';
import { homePathForRoles } from '@/lib/session';
import { ApiError } from '@/lib/api-client';
import { getTranslator } from '@/lib/i18n';
import AuthShell from '@/components/AuthShell';
import { User, Users, Book } from '@/components/icons';

type Intent = 'student' | 'parent' | 'tutor';

export default function RegisterPage({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const router = useRouter();

  const [intent, setIntent] = useState<Intent>('student');
  const [displayName, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const roleOptions: { key: Intent; icon: React.ReactNode; label: string; desc: string }[] = [
    { key: 'student', icon: <User />, label: t('role.student'), desc: t('role.student.desc') },
    { key: 'parent', icon: <Users />, label: t('role.parent'), desc: t('role.parent.desc') },
    { key: 'tutor', icon: <Book />, label: t('role.tutor'), desc: t('role.tutor.desc') },
  ];

  async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    if (password.length < 12) {
      setError(t('auth.password.min'));
      return;
    }
    setLoading(true);
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem('edu.roleIntent', intent);
      await register(email.trim(), password, displayName.trim());
      const token = getAccessToken();
      const roles = token ? decodeClaims(token)?.roles ?? [] : [];
      router.push(homePathForRoles(lang, roles));
    } catch (err) {
      if (err instanceof ApiError) setError(err.body?.error?.message ?? t('auth.register.failed'));
      else setError(t('auth.network'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell lang={lang} title={t('auth.register.title')} subtitle={t('auth.register.subtitle')}>
      <form onSubmit={onSubmit}>
        <label className="label">{t('auth.iam')}</label>
        <div className="stack gap-1 mb-2">
          {roleOptions.map((r) => (
            <button
              type="button"
              key={r.key}
              onClick={() => setIntent(r.key)}
              className="card"
              style={{
                display: 'flex', alignItems: 'center', gap: '.8rem', textAlign: 'start', cursor: 'pointer', padding: '.8rem 1rem',
                borderColor: intent === r.key ? 'var(--primary)' : 'var(--border)',
                boxShadow: intent === r.key ? '0 0 0 3px var(--ring)' : 'none',
              }}
            >
              <span className="brand-mark" style={{ width: 38, height: 38 }}>{r.icon}</span>
              <span>
                <strong style={{ display: 'block' }}>{r.label}</strong>
                <span className="muted small">{r.desc}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="field">
          <label className="label">{t('auth.name')}</label>
          <input className="input" value={displayName} required onChange={(e) => setName(e.target.value)} placeholder={t('auth.name.ph')} />
        </div>
        <div className="field">
          <label className="label">{t('auth.email')}</label>
          <input className="input" type="email" value={email} required onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">{t('auth.password')}</label>
          <input className="input" type="password" value={password} required onChange={(e) => setPassword(e.target.value)} />
          <div className="hint">{t('auth.password.hint')}</div>
        </div>

        {error && <div className="alert alert-danger mb-2">{error}</div>}
        <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : t('auth.register.action')}
        </button>
      </form>
      <p className="text-c muted small mt-3">
        {t('auth.haveAccount')} <a href={`/${lang}/login`} style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('auth.signin.action')}</a>
      </p>
    </AuthShell>
  );
}