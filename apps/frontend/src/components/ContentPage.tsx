import type { ReactNode } from 'react';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import BackButton from './BackButton';

/** Simple public content page shell (marketing/legal/info pages). */
export default function ContentPage({
  lang,
  title,
  lead,
  children,
  wide,
}: {
  lang: string;
  title: string;
  lead?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <>
      <SiteHeader lang={lang} />
      <main>
        <section className="section" style={{ background: 'var(--bg-elev)', borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
          <div className="container">
            <div style={{ marginBottom: '.5rem' }}><BackButton lang={lang} /></div>
            <h1 className="mb-0">{title}</h1>
            {lead && <p className="lead mt-1">{lead}</p>}
          </div>
        </section>
        <section className="section container" style={{ maxWidth: wide ? undefined : 820, paddingTop: '2.5rem' }}>
          {children}
        </section>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}