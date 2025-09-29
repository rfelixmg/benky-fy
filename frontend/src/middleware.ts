import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPath = pathname === '/login';
  const hasSession = request.cookies.has('session');

  // Redirect to login if no session and trying to access protected route
  if (!hasSession && !isPublicPath) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    return response;
  }

  // Redirect to home if has session and trying to access login
  if (hasSession && isPublicPath) {
    const response = NextResponse.redirect(new URL('/', request.url));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};