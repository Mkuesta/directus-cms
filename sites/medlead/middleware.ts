import { NextResponse, type NextRequest } from 'next/server';
import { getSecurityHeaders, getCSP } from '@/lib/security';
import { redirects } from '@/lib/redirects';

export async function middleware(request: NextRequest) {
  // Check for CMS-managed redirects first
  try {
    const match = await redirects.matchRedirect(request.nextUrl.pathname);
    if (match) {
      const destination = match.destination.startsWith('http')
        ? match.destination
        : new URL(match.destination, request.url).toString();
      return NextResponse.redirect(destination, match.statusCode);
    }
  } catch {
    // Redirects collection not yet provisioned or error — continue normally
  }

  const response = NextResponse.next();

  // Add security headers
  const securityHeaders = getSecurityHeaders();
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  // Add Content Security Policy
  response.headers.set('Content-Security-Policy', getCSP());

  // Add Strict-Transport-Security for HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
