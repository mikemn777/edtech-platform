'use client';

import { useState } from 'react';
import { getTranslator, getDirection } from '@/lib/i18n';
import { Refresh } from './icons';

/** Reloads the current route so its data is re-fetched. RTL-aware (mirrors like BackButton). */
export default function RefreshButton({ lang }: { lang: string }) {
  const t = getTranslator(lang);
  const rtl = getDirection(lang) === 'rtl';
  const [spinning, setSpinning] = useState(false);

  function refresh() {
    setSpinning(true);
    window.location.reload();
  }

  return (
    <button
      className="icon-btn"
      onClick={refresh}
      aria-label={t('common.refresh')}
      title={t('common.refresh')}
    >
      <Refresh
        width={18}
        height={18}
        style={{ transform: rtl ? 'scaleX(-1)' : 'none', animation: spinning ? 'spin 0.7s linear infinite' : 'none' }}
      />
    </button>
  );
}
