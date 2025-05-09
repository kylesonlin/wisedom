import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { rateLimiter } from './utils/rate-limiter'
import { validateRequest } from './middleware/request-validation'
import { securityMonitoring } from './services/security-monitoring'
import { getSession } from '@/utils/auth'

// CSRF token generation using Web Crypto API
async function generateCSRFToken(): Promise<string> {
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);
  return Array.from(buffer)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ['/auth/signin', '/auth/signup', '/auth/reset-password'];
  if (publicPaths.includes(pathname)) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!session) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check if 2FA is required
  if (session.requiresTwoFactor && !pathname.startsWith('/auth/2fa')) {
    const twoFactorUrl = new URL('/auth/2fa', request.url);
    twoFactorUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(twoFactorUrl);
  }

  // Allow access to the requested path
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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 