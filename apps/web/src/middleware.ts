import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'es', 'pt'];
const defaultLocale = 'es';

function getLocale(request: NextRequest) {
  const acceptLang = request.headers.get('accept-language') || '';
  if (acceptLang.includes('pt')) return 'pt';
  if (acceptLang.includes('en')) return 'en';
  return 'es'; // default
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip if it has a locale, is an API route, or is a static file
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale || pathname.startsWith('/api') || pathname.includes('.')) {
    return;
  }

  // Redirect if there is no locale
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
