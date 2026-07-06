import { NextRequest, NextResponse } from 'next/server';

/**
 * Language routing middleware (Blueprint §2.2). Ensures every route is prefixed
 * with a supported language segment; detects from the path, then Accept-Language,
 * then falls back to the default. No hardcoded assumptions beyond the supported
 * set, which derives from the shared localization package.
 */
const SUPPORTED = ['en', 'ar', 'tr'];
const DEFAULT_LANGUAGE = 'en';

function detectLanguage(req: NextRequest): string {
  const header = req.headers.get('accept-language');
  if (header) {
    for (const part of header.split(',')) {
      const code = part.trim().slice(0, 2).toLowerCase();
      if (SUPPORTED.includes(code)) return code;
    }
  }
  return DEFAULT_LANGUAGE;
}

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  // Skip Next internals and static assets.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const hasLang = SUPPORTED.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLang) return NextResponse.next();

  const language = detectLanguage(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${language}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
