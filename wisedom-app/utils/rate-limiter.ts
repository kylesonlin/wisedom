interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

class RateLimiter {
  private buckets: Map<string, TokenBucket>;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second
  private readonly refillInterval: number; // milliseconds

  constructor(maxTokens: number = 100, refillRate: number = 10) {
    this.buckets = new Map();
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;
    this.refillInterval = 1000 / refillRate;
  }

  private refillBucket(bucket: TokenBucket): void {
    const now = Date.now();
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor(timePassed / this.refillInterval);
    
    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(this.maxTokens, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
    }
  }

  isAllowed(ip: string): boolean {
    if (!this.buckets.has(ip)) {
      this.buckets.set(ip, {
        tokens: this.maxTokens,
        lastRefill: Date.now(),
      });
    }

    const bucket = this.buckets.get(ip)!;
    this.refillBucket(bucket);

    if (bucket.tokens > 0) {
      bucket.tokens--;
      return true;
    }

    return false;
  }

  getRemainingTokens(ip: string): number {
    if (!this.buckets.has(ip)) {
      return this.maxTokens;
    }

    const bucket = this.buckets.get(ip)!;
    this.refillBucket(bucket);
    return bucket.tokens;
  }
}

export const rateLimiter = new RateLimiter();

export const withRateLimit = (handler: Function) => {
  return async (req: any, res: any) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
      req.headers['x-real-ip'] ||
      req.socket.remoteAddress ||
      'unknown';

    if (!rateLimiter.isAllowed(ip)) {
      return res.status(429).json({
        error: 'Too Many Requests',
        retryAfter: 60,
        remaining: rateLimiter.getRemainingTokens(ip)
      });
    }

    return handler(req, res);
  };
}; 