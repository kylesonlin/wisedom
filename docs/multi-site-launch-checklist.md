# Wisedom.ai Multi-Site Launch Checklist

## 1. **Directory & File Structure**
- [ ] `app/marketing/` contains all marketing pages (landing, about, features, etc.)
- [ ] `app/dashboard/` (or `app/app/`) contains all app/dashboard pages
- [ ] Each site has its own `layout.tsx` and `page.tsx`
- [ ] Shared components are in `app/components/` or similar

## 2. **Content & Design**
- [ ] Marketing landing page is modern, visually engaging, and mobile responsive
- [ ] App/dashboard has its own distinct layout and navigation
- [ ] All links and CTAs point to the correct domains (e.g., "Launch App" → `app.wisedom.ai`)
- [ ] SEO tags and metadata are set for both sites

## 3. **Routing & Domain Handling**
- [ ] `next.config.js` rewrites are set up:
  - [ ] Requests to `wisedom.ai` → `app/marketing/*`
  - [ ] Requests to `app.wisedom.ai` → `app/dashboard/*` (or `app/app/*`)
- [ ] `middleware.ts` handles domain-based logic (auth, redirects, etc.)
- [ ] No cross-site content leakage (marketing content on app, or vice versa)

## 4. **Authentication & Security**
- [ ] App site (`app.wisedom.ai`) requires authentication for protected routes
- [ ] Marketing site (`wisedom.ai`) is public and does not require login
- [ ] Proper session and 2FA handling in middleware
- [ ] Security headers set in `next.config.js`

## 5. **Styling & Theming**
- [ ] Only one `ThemeProvider` is active at the root (no duplicates)
- [ ] Both sites use consistent theme variables and Tailwind classes
- [ ] No style conflicts between marketing and app

## 6. **Testing**
- [ ] Local `/etc/hosts` entries for both domains (for local testing)
- [ ] Test both `wisedom.ai` and `app.wisedom.ai` locally and in production
- [ ] Check for console errors, broken links, and layout issues

## 7. **Deployment**
- [ ] Vercel (or other host) is configured with both domains
- [ ] Environment variables are set for both environments
- [ ] CI/CD pipeline is working and deploys on push

## 8. **Post-Launch**
- [ ] Monitor analytics for both sites
- [ ] Set up error tracking and uptime monitoring
- [ ] Collect user feedback for further improvements 