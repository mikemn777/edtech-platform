import type { ReactNode } from 'react';
import { getDirection, resolveLanguage, SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { NO_FLASH_SCRIPT } from '@/lib/theme';

/** Pre-generate the supported-language routes (Art. III; unlimited via config). */
export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({ lang }));
}

export default function LanguageLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { lang: string };
}) {
  const language = resolveLanguage(params.lang);
  const dir = getDirection(language);
  return (
    <html lang={language} dir={dir} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}