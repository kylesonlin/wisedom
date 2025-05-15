interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  staleWhileRevalidate?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl?: number;
}

class Cache {
  private static instance: Cache;
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.cache = new Map();
  }

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) return null;

    const now = Date.now();
    const isExpired = entry.ttl && now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: options.ttl || this.defaultTTL,
    };

    this.cache.set(key, entry);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== null) {
      if (options.staleWhileRevalidate) {
        // Trigger revalidation in the background
        fetchFn().then((freshData) => {
          this.set(key, freshData, options);
        });
      }
      return cached;
    }

    const data = await fetchFn();
    this.set(key, data, options);
    return data;
  }
}

export const cache = Cache.getInstance(); 