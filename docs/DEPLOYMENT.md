# Deployment Guide

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Vercel CLI (optional)

## Environment Setup

1. Create a new project on Vercel
2. Set up the following environment variables in Vercel:

```env
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_SITE_URL=your_site_url
NEXT_PUBLIC_SITE_NAME=your_site_name
NEXT_PUBLIC_SITE_DESCRIPTION=your_site_description
```

## Deployment Steps

1. **Local Testing**
   ```bash
   npm run build
   npm run start
   ```

2. **Vercel Deployment**
   - Connect your GitHub repository to Vercel
   - Configure build settings:
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Install Command: `npm install`

3. **Post-Deployment**
   - Verify environment variables
   - Check Sentry integration
   - Test rate limiting
   - Verify security headers
   - Check SEO setup

## Monitoring

1. **Performance Monitoring**
   - Check Vercel Analytics
   - Monitor Sentry for errors
   - Review performance metrics

2. **Security**
   - Verify CSP headers
   - Check rate limiting
   - Monitor for suspicious activity

## Troubleshooting

1. **Build Failures**
   - Check Node.js version
   - Verify environment variables
   - Review build logs

2. **Runtime Errors**
   - Check Sentry for error reports
   - Review server logs
   - Verify API connectivity

## Rollback Procedure

1. **Vercel Dashboard**
   - Go to Deployments
   - Select previous deployment
   - Click "Promote to Production"

2. **Manual Rollback**
   ```bash
   git checkout <previous-version>
   npm run build
   vercel --prod
   ``` 