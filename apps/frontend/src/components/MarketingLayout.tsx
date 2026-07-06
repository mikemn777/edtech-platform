import type { ReactNode } from 'react';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

/** Shell for public marketing/content pages: header + content + footer. */
export default function MarketingLayout({ lang, children }: { lang: string; children: ReactNode }) {
  return (
    <>
      <SiteHeader lang={lang} />
      <main>{children}</main>
      <SiteFooter lang={lang} />
    </>
  );
}