# Wisedom App Gradual Restore & Review Roadmap

## Checklist

- [x] **Minimal Baseline:** `app/page.tsx` is a minimal "Hello World". Confirm Vercel and static file serving work.
- [ ] **Restore Layout:** Review and edit `app/layout.tsx` for correctness and minimalism. Ensure only essential providers and metadata are included. Push and deploy. Confirm "Hello World" still loads and check for static file errors.
- [ ] **Restore Page Structure Incrementally:** Add back one section/component at a time to `app/page.tsx`. After each addition, review, edit, push, and deploy. Suggested order:
  - [ ] Add layout structure (main divs, minimal header/sidebar).
  - [ ] Add one component at a time (e.g., `DashboardSidebar`, `DashboardHeader`, etc.).
  - [ ] Add each widget or feature (e.g., `WelcomeWidget`, `IndustryUpdates`, etc.).
  - [ ] Add any dynamic imports or advanced logic last.
- [ ] **Restore Other App Directories (if needed):** Only restore routes and components as needed for each test. Review and edit each before pushing.
- [ ] **Restore Global Styles and Providers:** Review `app/globals.css` and `app/components/Providers.tsx` for any code that could break SSR or static export. Add back after confirming main layout and page work.
- [ ] **Restore Middleware, Custom Config, and Advanced Features:** Review `middleware.ts` and any custom hooks, lib, or config files. Add back one at a time, testing after each.
- [ ] **Final Full Restore:** Once all pieces are restored and tested, merge back to main.
- [ ] **Final Verification & Cleanup:**
  - [ ] Confirm `<link rel="stylesheet">` is present in the `<head>` and static CSS/JS are resolving at `/_next/static/...` with 200s in the network tab.
  - [ ] Remove any test/dummy code (e.g., DummyTailwind, test.css, ClientCssLoader if not needed).
  - [ ] Confirm the app is fully styled and functional on both preview and custom domains.

---

# How to Use This Roadmap

- **Before each step:**  
  - Review and edit the file/component for correctness and minimalism.
- **After each step:**  
  - Push to the test branch and deploy.
  - Test the deployment for static file errors and correct rendering.
- **If a step breaks:**  
  - The last change contains the problematic code—review it in detail. 