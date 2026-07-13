/**
 * @edu/localization — translation resource registry (Constitution Art. III).
 * Launch languages: English (default/fallback), Arabic (RTL), Turkish.
 * Unlimited future languages are added by adding a resource folder — no code change (Art. 3.2).
 */
import en from './en/common.json';
import ar from './ar/common.json';
import tr from './tr/common.json';
type LanguageCode = 'en' | 'ar' | 'tr' | string;
type TextDirection = 'ltr' | 'rtl';

export type TranslationBundle = Record<string, string>;

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const bundles: Record<string, TranslationBundle> = { en, ar, tr };

/** Always-present fallback bundle (typed directly, not via indexed access, so
 * it can't be `undefined` — `bundles[DEFAULT_LANGUAGE]` structurally is `en`). */
const FALLBACK_BUNDLE: TranslationBundle = en;

/** RTL languages — extend via configuration as languages are added (Art. 3.3). */
const RTL_LANGUAGES = new Set<LanguageCode>(['ar']);

export function directionFor(language: LanguageCode): TextDirection {
  return RTL_LANGUAGES.has(language) ? 'rtl' : 'ltr';
}

/**
 * Resolve a key for a language with graceful fallback to the default language
 * (Blueprint §7.4 / Requirements EC-006 — missing translation degrades safely).
 */
export function translate(language: LanguageCode, key: string): string {
  const bundle = bundles[language] ?? FALLBACK_BUNDLE;
  return bundle[key] ?? FALLBACK_BUNDLE[key] ?? key;
}

