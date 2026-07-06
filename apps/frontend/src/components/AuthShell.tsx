import type { ReactNode } from 'react';
import { getTranslator } from '@/lib/i18n';
import { Check } from './icons';

/** Split-screen auth layout: brand/benefits panel + form card. Responsive. */
export default function AuthShell({
  lang,
  title,
  subtitle,
  children,
}: {
  lang: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const t = getTranslator(lang);
  const points = [t('auth.benefit1'), t('auth.benefit2'), t('auth.benefit3')];

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="auth-grid">
      <aside
        className="hide-sm"
        style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg, var(--brand-700), var(--accent-600))', color: '#fff', padding: '3rem' }}
      >
        <a href={`/${lang}`} className="brand" style={{ color: '#fff' }}>
          <span className="brand-mark" style={{ background: 'rgba(255,255,255,.2)' }}>E</span>
          <span>Eduspark</span>
        </a>
        <div style={{ marginTop: '20vh', maxWidth: 420 }}>
          <h2 style={{ color: '#fff', fontSize: '2rem' }}>{t('auth.brand.title')}</h2>
          <p style={{ color: 'rgba(255,255,255,.9)' }}>{t('auth.brand.subtitle')}</p>
          <div className="stack gap-2 mt-3">
            {points.map((p) => (
              <div className="row gap-2" key={p}>
                <span style={{ background: 'rgba(255,255,255,.2)', borderRadius: 999, width: 26, height: 26, display: 'grid', placeItems: 'center', flex: 'none' }}>
                  <Check width={15} height={15} />
                </span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main style={{ display: 'grid', placeItems: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <a href={`/${lang}`} className="brand" style={{ marginBottom: '1.5rem' }}>
            <span className="brand-mark">E</span><span>Eduspark</span>
          </a>
          <h1 style={{ fontSize: '1.6rem' }}>{title}</h1>
          {subtitle && <p className="muted">{subtitle}</p>}
          <div className="mt-3">{children}</div>
        </div>
      </main>

      <style>{`@media (max-width:760px){.auth-grid{grid-template-columns:1fr !important}}`}</style>
    </div>
  );
}