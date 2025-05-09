module.exports = {
  // Core Web Vitals thresholds
  coreWebVitals: {
    lcp: {
      good: 2500, // 2.5 seconds
      poor: 4000  // 4 seconds
    },
    fid: {
      good: 100,  // 100 milliseconds
      poor: 300   // 300 milliseconds
    },
    cls: {
      good: 0.1,  // 0.1
      poor: 0.25  // 0.25
    }
  },

  // Bundle size limits
  bundleSize: {
    js: {
      initial: 170 * 1024,  // 170KB
      total: 500 * 1024     // 500KB
    },
    css: {
      initial: 50 * 1024,   // 50KB
      total: 100 * 1024     // 100KB
    },
    images: {
      maxSize: 200 * 1024   // 200KB per image
    }
  },

  // Performance metrics
  metrics: {
    firstContentfulPaint: 1800,    // 1.8 seconds
    largestContentfulPaint: 2500,  // 2.5 seconds
    timeToInteractive: 3500,       // 3.5 seconds
    totalBlockingTime: 300,        // 300 milliseconds
    speedIndex: 2000,              // 2 seconds
    firstMeaningfulPaint: 2000,    // 2 seconds
    firstCPUIdle: 3000,            // 3 seconds
    maxPotentialFID: 100,          // 100 milliseconds
  },

  // Resource timing
  resourceTiming: {
    dnsLookup: 100,        // 100ms
    tcpConnection: 200,    // 200ms
    sslHandshake: 300,     // 300ms
    ttfb: 600,             // 600ms
    download: 1000,        // 1s
    domProcessing: 500,    // 500ms
    resourceLoad: 2000     // 2s
  },

  // API performance
  api: {
    responseTime: {
      p50: 200,    // 200ms
      p90: 500,    // 500ms
      p99: 1000    // 1s
    },
    errorRate: 0.01  // 1%
  },

  // Caching
  caching: {
    staticAssets: 86400,     // 24 hours
    apiResponses: 300,       // 5 minutes
    serviceWorker: 3600      // 1 hour
  },

  // Network
  network: {
    maxConcurrentRequests: 6,
    maxRequestSize: 1024 * 1024,  // 1MB
    minCompressionRatio: 0.7      // 70% compression
  },

  // Rendering
  rendering: {
    maxFPS: 60,
    minFPS: 30,
    maxFrameTime: 33,        // 33ms (30fps)
    maxPaintTime: 16         // 16ms (60fps)
  },

  // Memory
  memory: {
    maxHeapSize: 50 * 1024 * 1024,  // 50MB
    maxJSHeapSize: 30 * 1024 * 1024 // 30MB
  }
}; 