'use client';

/** Theme (light/dark) helpers. Persists choice; respects OS preference first time. */
export type Theme = 'light' | 'dark';
const KEY = 'edu.theme';

export function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem(KEY);
  return v === 'dark' || v === 'light' ? v : null;
}

export function resolveInitialTheme(): Theme {
  const stored = getStoredTheme();
  if (stored) return stored;
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
}

export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, theme);
  applyTheme(theme);
}

/** Inline script string injected in <head> to set the theme before paint (no flash). */
export const NO_FLASH_SCRIPT = `(function(){try{var t=localStorage.getItem('edu.theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;