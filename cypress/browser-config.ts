export const browserConfig = {
  browsers: [
    {
      name: 'chrome',
      family: 'chromium',
      channel: 'stable',
      displayName: 'Chrome',
      version: 'latest',
      path: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    },
    {
      name: 'firefox',
      family: 'firefox',
      channel: 'stable',
      displayName: 'Firefox',
      version: 'latest',
      path: '/Applications/Firefox.app/Contents/MacOS/firefox',
    },
    {
      name: 'edge',
      family: 'chromium',
      channel: 'stable',
      displayName: 'Edge',
      version: 'latest',
      path: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    },
  ],
  viewports: {
    mobile: {
      width: 375,
      height: 667,
    },
    tablet: {
      width: 768,
      height: 1024,
    },
    desktop: {
      width: 1280,
      height: 720,
    },
  },
  performance: {
    budget: {
      firstContentfulPaint: 1000,
      largestContentfulPaint: 2000,
      totalBlockingTime: 300,
      cumulativeLayoutShift: 0.1,
    },
  },
}; 