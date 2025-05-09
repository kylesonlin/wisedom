export const loadBalancerConfig = {
  // Health check settings
  healthCheck: {
    interval: 30000, // 30 seconds
    timeout: 5000,   // 5 seconds
    unhealthyThreshold: 3,
    healthyThreshold: 2,
    path: '/api/health',
    protocol: 'https',
  },

  // Rate limiting settings
  rateLimit: {
    enabled: true,
    windowMs: 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
  },

  // Circuit breaker settings
  circuitBreaker: {
    enabled: true,
    timeout: 3000, // 3 seconds
    errorThreshold: 50, // percentage
    resetTimeout: 30000, // 30 seconds
  },

  // Load balancing algorithm
  algorithm: 'round-robin' as const, // 'round-robin' | 'least-connections' | 'ip-hash'

  // Backend servers
  servers: [
    {
      host: 'localhost',
      port: 3000,
      weight: 1,
      maxConnections: 1000,
    },
  ],

  // SSL/TLS settings
  ssl: {
    enabled: true,
    redirectHttps: true,
    hsts: {
      enabled: true,
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  },

  // Proxy settings
  proxy: {
    timeout: 10000, // 10 seconds
    proxyTimeout: 30000, // 30 seconds
    keepAlive: true,
    keepAliveTimeout: 60000, // 60 seconds
  },

  // Compression settings
  compression: {
    enabled: true,
    level: 6, // compression level (1-9)
    threshold: 1024, // min size to compress (bytes)
    mimeTypes: [
      'text/plain',
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
      'application/json',
      'application/xml',
    ],
  },

  // Caching settings
  caching: {
    enabled: true,
    ttl: 3600, // 1 hour
    staleWhileRevalidate: true,
    maxAge: 86400, // 24 hours
  },

  // Security settings
  security: {
    enabled: true,
    xssProtection: true,
    nosniff: true,
    hideServerHeader: true,
    referrerPolicy: 'strict-origin-when-cross-origin',
  },
} as const; 