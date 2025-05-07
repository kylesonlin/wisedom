/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
  generateRobotsTxt: false, // We're using the App Router robots.ts
  generateIndexSitemap: true,
  outDir: 'public',
  exclude: ['/api/*', '/admin/*', '/private/*'],
  alternateRefs: [],
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: path === '/' ? 'daily' : 'weekly',
      priority: path === '/' ? 1 : 0.8,
      lastmod: new Date().toISOString(),
    }
  },
} 