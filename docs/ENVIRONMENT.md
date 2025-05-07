# Environment Setup Guide

## Required Environment Variables

### Production Variables
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token

# Feature Flags
NEXT_PUBLIC_ENABLE_BETA_FEATURES=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Security
NEXT_PUBLIC_CSP_REPORT_URI=https://yourdomain.com/csp-report
NEXT_PUBLIC_ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com

# Performance
NEXT_PUBLIC_ENABLE_CACHE=true
NEXT_PUBLIC_CACHE_DURATION=3600

# SEO
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME=Your App Name
NEXT_PUBLIC_SITE_DESCRIPTION=Your app description
```

### Development Variables
```env
# Development-specific settings
NEXT_PUBLIC_ENABLE_DEV_TOOLS=true
NEXT_PUBLIC_ENABLE_MOCK_API=true
NEXT_PUBLIC_MOCK_API_DELAY=1000
```

## Setting Up Environment Variables

### Local Development
1. Create `.env.local` file in project root
2. Copy required variables from above
3. Fill in appropriate values
4. Restart development server

### Production (Vercel)
1. Go to Vercel project settings
2. Navigate to Environment Variables
3. Add each variable from Production Variables section
4. Deploy project to apply changes

## Environment Variable Types

### Public Variables
- Prefixed with `NEXT_PUBLIC_`
- Accessible in browser
- Used for client-side configuration

### Private Variables
- No `NEXT_PUBLIC_` prefix
- Only accessible server-side
- Used for sensitive data

## Security Considerations

1. **Never commit `.env` files**
   - Add to `.gitignore`
   - Use `.env.example` for templates

2. **Production Secrets**
   - Use Vercel's encrypted environment variables
   - Rotate keys regularly
   - Use different values for dev/prod

3. **API Keys**
   - Store in secure vault
   - Use environment-specific keys
   - Monitor usage

## Troubleshooting

### Common Issues

1. **Missing Variables**
   ```bash
   Error: Missing required environment variable: NEXT_PUBLIC_API_URL
   ```
   Solution: Add missing variable to environment file

2. **Invalid Values**
   ```bash
   Error: Invalid environment variable format
   ```
   Solution: Check variable format and type

3. **Build Failures**
   ```bash
   Error: Environment variables not loaded
   ```
   Solution: Verify `.env` file location and format

### Debugging

1. **Check Variable Loading**
   ```typescript
   console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
   ```

2. **Verify Environment**
   ```typescript
   console.log('NODE_ENV:', process.env.NODE_ENV);
   ```

3. **Test API Connection**
   ```typescript
   fetch(process.env.NEXT_PUBLIC_API_URL)
     .then(response => console.log('API Status:', response.status))
     .catch(error => console.error('API Error:', error));
   ``` 