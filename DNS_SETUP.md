# DNS and SSL Setup Guide

## DNS Records Setup

### For wisedom.ai (Marketing Site)
1. Add an A record:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21 (Vercel's IP)
   TTL: Auto
   ```

2. Add a CNAME record for www:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: Auto
   ```

### For app.wisedom.ai (Application)
1. Add a CNAME record:
   ```
   Type: CNAME
   Name: app
   Value: cname.vercel-dns.com
   TTL: Auto
   ```

## SSL Certificate Setup

Both domains will automatically get SSL certificates through Vercel. No manual setup is required.

## Verification Steps

1. Verify DNS propagation:
   ```bash
   dig wisedom.ai
   dig www.wisedom.ai
   dig app.wisedom.ai
   ```

2. Check SSL certificates:
   ```bash
   curl -vI https://wisedom.ai
   curl -vI https://app.wisedom.ai
   ```

## Monitoring Setup

1. Set up Vercel Analytics for both sites
2. Configure Sentry for error tracking
3. Set up Google Analytics

## Required Environment Variables

### Marketing Site (wisedom.ai)
```
NEXT_PUBLIC_SITE_URL=https://wisedom.ai
NEXT_PUBLIC_APP_URL=https://app.wisedom.ai
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_GA_ID=your_ga_id
```

### App (app.wisedom.ai)
```
NEXT_PUBLIC_APP_URL=https://app.wisedom.ai
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_GA_ID=your_ga_id
```

## Deployment Verification

After deployment, verify:
1. Both sites are accessible via HTTPS
2. Marketing site redirects /app to app.wisedom.ai
3. All assets load correctly
4. No mixed content warnings
5. SSL certificates are valid
6. Analytics are tracking correctly 