import { bundles, DEFAULT_LANGUAGE, directionFor, translate } from '@edu/localization';
import type { LanguageCode, TextDirection } from '@edu/types';

/**
 * Frontend i18n helpers (Blueprint §2.2, §3.5). Languages, direction (RTL
 * first-class — Constitution Art. 3.3), and translation all flow through the
 * shared @edu/localization package — no user-facing string is hardcoded.
 * Unlimited future languages are added by extending that package (Art. 3.2).
 */
export const SUPPORTED_LANGUAGES: LanguageCode[] = Object.keys(bundles);

export function isSupportedLanguage(value: string): value is LanguageCode {
  return SUPPORTED_LANGUAGES.includes(value);
}

export function resolveLanguage(candidate: string | undefined): LanguageCode {
  if (candidate && isSupportedLanguage(candidate)) return candidate;
  return DEFAULT_LANGUAGE;
}

export function getDirection(language: LanguageCode): TextDirection {
  return directionFor(language);
}

/** Build a bound translator for a resolved language (graceful fallback — EC-006). */
export function getTranslator(language: LanguageCode): (key: string) => string {
  const lang = resolveLanguage(language);
  return (key: string) => translate(lang, key);
}
