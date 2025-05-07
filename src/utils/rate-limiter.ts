interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private buckets: Map<string, TokenBucket>;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second
  private readonly refillInterval: number; // milliseconds

  private constructor() {
    this.buckets = new Map();
    this.maxTokens = 100;
    this.refillRate = 10;
    this.refillInterval = 1000; // 1 second
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  private refillBucket(bucket: TokenBucket): void {
    const now = Date.now();
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor((timePassed / this.refillInterval) * this.refillRate);

    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(this.maxTokens, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
    }
  }

  public isAllowed(key: string): boolean {
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = {
        tokens: this.maxTokens,
        lastRefill: Date.now(),
      };
      this.buckets.set(key, bucket);
    }

    this.refillBucket(bucket);

    if (bucket.tokens > 0) {
      bucket.tokens--;
      return true;
    }

    return false;
  }

  public getRemainingTokens(key: string): number {
    const bucket = this.buckets.get(key);
    if (!bucket) return this.maxTokens;

    this.refillBucket(bucket);
    return bucket.tokens;
  }

  public clearBucket(key: string): void {
    this.buckets.delete(key);
  }
}

export const rateLimiter = RateLimiter.getInstance(); 