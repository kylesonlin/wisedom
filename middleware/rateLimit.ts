import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/utils/cache';

interface RateLimitConfig {
  maxRequests: number;  // Maximum requests per window
  windowMs: number;     // Time window in milliseconds
  message?: string;     // Custom error message
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
  message: 'Too many requests, please try again later.'
};

export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const { maxRequests, windowMs, message } = { ...DEFAULT_CONFIG, ...config };

  return async function rateLimitMiddleware(
    req: NextRequest,
    res: NextResponse
  ) {
    const ip = req.ip || 'unknown';
    const key = `rate-limit:${ip}`;

    // Get current rate limit info
    const rateLimitInfo = await cache.get<RateLimitInfo>(key);
    const now = Date.now();

    if (!rateLimitInfo) {
      // First request from this IP
      await cache.set(key, {
        count: 1,
        resetTime: now + windowMs
      }, { ttl: windowMs });

      return NextResponse.next();
    }

    if (now > rateLimitInfo.resetTime) {
      // Window has expired, reset counter
      await cache.set(key, {
        count: 1,
        resetTime: now + windowMs
      }, { ttl: windowMs });

      return NextResponse.next();
    }

    // Increment counter
    const newCount = rateLimitInfo.count + 1;
    await cache.set(key, {
      count: newCount,
      resetTime: rateLimitInfo.resetTime
    }, { ttl: windowMs });

    // Check if limit exceeded
    if (newCount > maxRequests) {
      return new NextResponse(
        JSON.stringify({
          error: message,
          retryAfter: Math.ceil((rateLimitInfo.resetTime - now) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimitInfo.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimitInfo.resetTime / 1000).toString()
          }
        }
      );
    }

    // Add rate limit headers
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', (maxRequests - newCount).toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitInfo.resetTime / 1000).toString());

    return response;
  };
}

// Export specific rate limiters for different endpoints
export const apiRateLimit = rateLimit();
export const authRateLimit = rateLimit({ maxRequests: 5, windowMs: 60 * 1000 });
export const searchRateLimit = rateLimit({ maxRequests: 30, windowMs: 60 * 1000 }); 