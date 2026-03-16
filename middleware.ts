import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['vi', 'ja'];
const defaultLocale = 'vi';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals, static files, API routes, and admin routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if pathname already has a locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const cookieLocale = request.cookies.get('betonabi_locale')?.value;
    const locale = locales.includes(cookieLocale as string) ? cookieLocale : defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}${pathname || '/'}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)'],
};
