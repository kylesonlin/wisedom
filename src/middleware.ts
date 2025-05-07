import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimiter } from './utils/rate-limiter';

export function middleware(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'anonymous';
  const isAllowed = rateLimiter.isAllowed(ip);

  if (!isAllowed) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': rateLimiter.getRemainingTokens(ip).toString(),
      },
    });
  }

  const response = NextResponse.next();

  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_ALLOWED_ORIGINS || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googleapis.com *.gstatic.com;
    style-src 'self' 'unsafe-inline' *.googleapis.com;
    img-src 'self' blob: data: *.googleapis.com;
    font-src 'self' data: *.gstatic.com;
    connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || '*'} ${process.env.NEXT_PUBLIC_SUPABASE_URL || '*'};
    frame-ancestors 'none';
    form-action 'self';
  `.replace(/\s+/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

// Specify which paths this middleware will run for
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. _next/static (static files)
     * 2. _next/image (image optimization files)
     * 3. favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 