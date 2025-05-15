module.exports = {
  // Content Security Policy
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https://api.example.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
    sandbox: ['allow-forms', 'allow-same-origin', 'allow-scripts'],
    reportUri: '/api/csp-report'
  },

  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },

  // X-Frame-Options
  xFrameOptions: 'DENY',

  // X-Content-Type-Options
  xContentTypeOptions: 'nosniff',

  // Referrer Policy
  referrerPolicy: 'strict-origin-when-cross-origin',

  // Permissions Policy
  permissionsPolicy: {
    accelerometer: [],
    camera: [],
    geolocation: [],
    gyroscope: [],
    magnetometer: [],
    microphone: [],
    payment: [],
    usb: []
  },

  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: 'same-site',

  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: 'same-origin',

  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: 'require-corp',

  // X-XSS-Protection
  xssProtection: '1; mode=block',

  // X-DNS-Prefetch-Control
  dnsPrefetchControl: 'off',

  // Expect-CT
  expectCt: {
    enforce: true,
    maxAge: 30,
    reportUri: '/api/ct-report'
  },

  // Feature-Policy
  featurePolicy: {
    accelerometer: [],
    camera: [],
    geolocation: [],
    gyroscope: [],
    magnetometer: [],
    microphone: [],
    payment: [],
    usb: []
  },

  // Cache-Control
  cacheControl: {
    default: 'no-store, max-age=0',
    static: 'public, max-age=31536000',
    api: 'no-store, max-age=0'
  },

  // Clear-Site-Data
  clearSiteData: ['cache', 'cookies', 'storage'],

  // Security Headers for API Routes
  apiHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  },

  // Security Headers for Static Assets
  staticHeaders: {
    'Cache-Control': 'public, max-age=31536000',
    'X-Content-Type-Options': 'nosniff'
  }
}; 