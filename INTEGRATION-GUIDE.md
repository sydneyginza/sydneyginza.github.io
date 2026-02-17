# Ginza Website Improvement Integration Guide

This document explains all improvements and how to integrate them into your existing codebase.

---

## Files Included

| File | Purpose |
|------|---------|
| `ginza.html` | **Fully rewritten** HTML with SEO, accessibility, semantic structure, mobile nav, employment cleanup |
| `styles-additions.css` | **Append** to existing `styles.css` — new styles for all features |
| `core-additions.js` | **New functions** to add to `core.js` — routing, Available Now, analytics, security |
| `ui-additions.js` | **Patches** for `ui.js` — page transitions, profile tabs, mobile nav sync |

---

## 1. SEO & Accessibility

### What changed in `ginza.html`:
- Added `<meta>` description, keywords, theme-color, OG tags
- Added `<script type="application/ld+json">` structured data for LocalBusiness
- All `<div class="page">` sections now use `role="main"` and `aria-labelledby`
- Section headings use proper `<h1>` through `<h3>` hierarchy
- All buttons/links have `aria-label` attributes
- SVG icons have `aria-hidden="true"`
- Decorative elements have `aria-hidden="true"`
- Form inputs have `<label for="">` associations
- Added focus-visible styles in CSS

### How to integrate:
**Replace** your existing `ginza.html` with the new version.

---

## 2. URL Routing / Deep Linking

### New in `core-additions.js`:
- `ROUTES` object maps hash paths to page IDs
- `pushRoute(pageId, profileName)` updates URL + document.title
- `handleRouteChange()` reads the hash and navigates
- `popstate` listener for back/forward browser buttons
- Profile deep links: `#/profile/GirlName`

### How to integrate:
1. Add all functions from `core-additions.js` to the end of `core.js`
2. In `ui.js`, modify `showPage()` to call `pushRoute(id)` (see ui-additions.js)
3. In `showProfile()`, call `pushRoute('profilePage', g.name)`
4. At end of init in `forms.js`, add: `if (window.location.hash) handleRouteChange();`
5. Update nav `<a>` hrefs in HTML to use `#/roster`, `#/girls`, etc. (already done in new HTML)

---

## 3. Mobile Experience (Bottom Nav)

### New in `ginza.html`:
- `<nav class="mobile-bottom-nav">` with 4 tabs: Home, Roster, Girls, Favs
- Shows only on screens < 768px

### New in `styles-additions.css`:
- `.mobile-bottom-nav` — fixed bottom bar with blur backdrop
- `.mob-nav-item` — tab styling with active state
- Safe area inset for iPhone notch
- `body` gets bottom padding on mobile to prevent content overlap

### New in `core-additions.js`:
- `updateMobileNav(pageId)` syncs active state
- `updateMobileFavBadge()` for fav count on mobile

### How to integrate:
1. Add the HTML (already in new `ginza.html`)
2. Append CSS (from `styles-additions.css`)
3. Call `updateMobileNav(id)` inside `showPage()`
4. Call `updateMobileFavBadge()` alongside existing `updateFavBadge()`

---

## 4. Image Optimization

### Recommendations (no code changes required yet):
1. **Serve through Cloudflare**: If your site is on Cloudflare, enable **Image Resizing** and transform URLs:
   ```
   /cdn-cgi/image/width=400,quality=80/https://raw.githubusercontent.com/...
   ```
2. **Generate WebP thumbnails** on upload (modify `uploadToGithub()` to also create a 400px-wide version)
3. **Add `loading="lazy" decoding="async"`** to all `<img>` tags (the helper `lazyThumbOptimized()` in core-additions.js does this)
4. Replace `lazyThumb()` calls with `lazyThumbOptimized()` for card thumbnails

---

## 6. "Available Now" Feature

### New in `core-additions.js`:
- `isAvailableNow(name)` — compares current AEDT time against scheduled start/end
- `getAvailableNowGirls()` — filters the roster
- `renderAvailableNow()` — builds the banner UI
- Auto-refreshes every 60 seconds

### New in `ginza.html`:
- `#availableNowBanner` and `#availableNowGrid` elements on home page

### New in `styles-additions.css`:
- `.available-now-banner` with pulsing green dot
- `.avnow-chip` for each available girl

### How to integrate:
1. Add the HTML (already in new `ginza.html`)
2. Append CSS
3. Add JS functions to `core.js`
4. Call `renderAvailableNow()` inside `renderHome()` and on init

---

## 7. Performance: Reduce Re-renders

### New in `core-additions.js`:
- `queueRender({ grid:true, roster:true, ... })` — batches multiple render calls into a single `requestAnimationFrame`

### How to integrate:
Replace patterns like:
```js
renderFilters(); renderGrid(); renderRoster(); renderHome();
```
With:
```js
queueRender({ filters:true, grid:true, roster:true, home:true, availableNow:true });
```

This is used in: `onFiltersChanged()`, `saveData()` success, `saveCalData()` success, login/logout, etc.

---

## 8. Better Profile Page Layout (Tabs)

### New in `styles-additions.css`:
- `.profile-tabs` / `.profile-tab` — tab bar
- `.profile-tab-content` — tab panels with fade-in animation
- `.profile-week-cal` — mini weekly availability calendar

### New in `ui-additions.js`:
- `buildProfileWeekCal(name)` — generates a 7-day availability grid
- Tab binding code for the profile page

### How to integrate:
In `showProfile()` in `ui.js`, wrap the details section in tabs (see the commented code in `ui-additions.js` for the exact structure). The three tabs are:
1. **Details** — stats, description, labels (existing content)
2. **Photos** — gallery thumbnails (moved from below the main image)
3. **Availability** — weekly mini-calendar showing which days the girl is scheduled

---

## 9. Security Hardening

### The problem:
Currently, `loadAuth()` fetches the full credentials list from GitHub and compares client-side. Anyone can intercept this.

### The solution (in `core-additions.js`):
- `secureLogin(user, pass)` — sends credentials to a server-side endpoint
- `secureVerifySession()` — validates an existing session token
- `secureLogout()` — clears session

### Required Cloudflare Worker changes:
Add these routes to your worker:

```js
// POST /auth/login
async function handleLogin(request) {
  const { user, pass } = await request.json();
  // Compare against your stored credentials (server-side only!)
  const AUTH = [{ user: 'admin', pass: 'admin123' }]; // Store in Worker secrets
  const match = AUTH.find(c => c.user === user && c.pass === pass);
  if (!match) return new Response('Unauthorized', { status: 401 });
  
  const token = crypto.randomUUID();
  // Store token in KV or Durable Object with expiry
  await AUTH_KV.put('session:' + token, user, { expirationTtl: 86400 });
  return Response.json({ token, user });
}

// GET /auth/verify
async function handleVerify(request) {
  const auth = request.headers.get('Authorization');
  const token = auth?.replace('Bearer ', '');
  const user = await AUTH_KV.get('session:' + token);
  if (!user) return new Response('Unauthorized', { status: 401 });
  return Response.json({ user });
}
```

### How to integrate:
1. Update your Cloudflare Worker with the auth endpoints
2. Set `USE_SECURE_AUTH = true` in core-additions.js
3. Modify `doLogin()` in ui.js to use `secureLogin()` instead of client-side comparison
4. Remove `loadAuth()` from the init sequence
5. On page load, call `secureVerifySession()` to restore sessions

---

## 11. Page Transitions

### New in `styles-additions.css`:
- `.page` — updated with `opacity` and `transform` transition
- `.page.page-exit` — exit animation class

### How to integrate:
The modified `showPage()` in `ui-additions.js` applies exit class to old page, waits 200ms, then activates new page. Replace the existing `showPage()`.

---

## 12. Employment Page Cleanup

### What changed in `ginza.html`:
- All unclosed `<div>` tags fixed
- Content restructured into:
  - **Hero section** with headline
  - **Card grid** (2 columns) for key selling points
  - **Accordion** (`<details>/<summary>`) for 3 FAQ sections
  - **Contact grid** with proper `<a href="tel:">` and `<a href="mailto:">` links

### New in `styles-additions.css`:
- `.emp-hero`, `.emp-grid`, `.emp-card` — layout
- `.emp-accordion`, `.emp-details`, `.emp-summary` — collapsible sections
- `.emp-contacts`, `.emp-contact-grid` — contact info cards

---

## 14. Analytics & Engagement Tracking

### New in `core-additions.js`:
- `GinzaAnalytics` object with:
  - `track(event, data)` — records an event
  - `trackPageView(pageId)` — page view tracking
  - `trackProfileView(name)` — profile view tracking
  - `trackFilter(type, value)` — filter usage tracking
  - `trackFavorite(name, added)` — favorite tracking
  - `flush()` — sends batched events via `sendBeacon`
  - Auto-flushes on unload/visibility-hidden

### Required backend:
Add a `POST /analytics` endpoint to your Cloudflare Worker that stores events (e.g., in KV or a database). Example:

```js
async function handleAnalytics(request) {
  const events = await request.json();
  // Store in KV with timestamp key
  const key = 'analytics:' + Date.now();
  await ANALYTICS_KV.put(key, JSON.stringify(events), { expirationTtl: 2592000 }); // 30 days
  return new Response('OK');
}
```

### How to integrate:
1. Add `GinzaAnalytics` from core-additions.js
2. Call `GinzaAnalytics.trackPageView(id)` in `showPage()`
3. Call `GinzaAnalytics.trackProfileView(g.name)` in `showProfile()`
4. Call `GinzaAnalytics.trackFavorite(name, nowFav)` in fav toggle handlers
5. Call `GinzaAnalytics.trackFilter(type, value)` in filter change handlers
6. Add the worker endpoint

---

## Quick Start: Minimal Integration

If you want the biggest impact with minimal effort, prioritize:

1. **Replace `ginza.html`** — instant SEO, accessibility, employment cleanup, mobile nav
2. **Append `styles-additions.css`** to your CSS — all new visual styles
3. **Add `renderAvailableNow()`** to core.js — "Available Now" feature
4. **Add routing functions** to core.js — deep linking + back button support
5. **Update `showPage()`** — transitions + routing + mobile nav sync

The security hardening and analytics require worker changes and can be done separately.
