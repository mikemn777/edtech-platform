'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Globe } from './icons';

const LANGS: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'tr', label: 'Türkçe' },
];

export default function LangSwitcher({ current }: { current: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function switchTo(code: string) {
    setOpen(false);
    const parts = (pathname || `/${current}`).split('/');
    if (parts.length > 1) parts[1] = code;
    router.push(parts.join('/') || `/${code}`);
  }

  return (
    <div style={{ position: 'relative' }}>
      <button className="icon-btn" onClick={() => setOpen((o) => !o)} aria-label="Change language" aria-expanded={open}>
        <Globe width={18} height={18} />
      </button>
      {open && (
        <div
          className="card"
          style={{ position: 'absolute', insetInlineEnd: 0, top: '46px', padding: '.35rem', minWidth: 150, zIndex: 60, boxShadow: 'var(--shadow-lg)' }}
        >
          {LANGS.map((l) => (
            <button
              key={l.code}
              className="btn btn-ghost btn-block"
              style={{ justifyContent: 'flex-start', fontWeight: l.code === current ? 700 : 500 }}
              onClick={() => switchTo(l.code)}
            >
              {l.label}
              {l.code === current ? ' ✓' : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}