## Environment Variables

All environment variables are managed through the Vercel dashboard.  
There is no `.env` file in this repository.

### Required Variables

#### Public (Browser-Accessible, prefixed with `NEXT_PUBLIC_`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_MIXPANEL_TOKEN`
- `NEXT_PUBLIC_ENABLE_BETA_FEATURES`
- `NEXT_PUBLIC_ENABLE_ANALYTICS`
- `NEXT_PUBLIC_CSP_REPORT_URI`
- `NEXT_PUBLIC_ALLOWED_ORIGINS`
- `NEXT_PUBLIC_ENABLE_CACHE`
- `NEXT_PUBLIC_CACHE_DURATION`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_SITE_DESCRIPTION`
- `NEXT_PUBLIC_ENABLE_DEV_TOOLS`
- `NEXT_PUBLIC_ENABLE_MOCK_API`
- `NEXT_PUBLIC_MOCK_API_DELAY`

#### Private (Server-Side Only, no prefix)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `NODE_ENV` (set automatically by Vercel)

#### Other Variables (Docker/CI, if relevant)
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `REDIS_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `CALENDAR_CLIENT_ID`
- `CALENDAR_CLIENT_SECRET`

> These are only needed if you use Docker or self-hosted environments, not for Vercel-only deployments.

### How to Set/Update

1. Go to your project in the [Vercel Dashboard](https://vercel.com/dashboard).
2. Navigate to **Settings** > **Environment Variables**.
3. Add or update the variables as needed.
4. Redeploy your project for changes to take effect.

> **Note:** For local development, you must set these variables in your shell or use `vercel env pull` to generate a local `.env` file if desired.

### Security Reminder
- Never commit secrets or sensitive values to your repository.
- Use Vercel's encrypted environment variable management for all secrets.
- Update this list if you add new integrations or variables.

> **Note:** For local development, you must set these variables in your shell or use `vercel env pull` to generate a local `.env` file if desired. 