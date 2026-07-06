'use client';

import { useEffect, useState } from 'react';
import { resolveInitialTheme, setTheme, type Theme } from '@/lib/theme';
import { Sun, Moon } from './icons';

export default function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setThemeState(resolveInitialTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setThemeState(next);
  }

  return (
    <button
      className="icon-btn"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      {mounted && theme === 'dark' ? <Sun width={18} height={18} /> : <Moon width={18} height={18} />}
    </button>
  );
}