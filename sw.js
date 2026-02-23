const CACHE = 'ginza-v1';
const SHELL = ['/', '/index.html', '/404.html', '/styles.css',
  '/js/i18n.js', '/js/core.js', '/js/ui.js',
  '/js/grids.js', '/js/forms.js', '/js/analytics.js', '/fav-icon.png'];

/* Pre-cache app shell on install */
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

/* Delete old caches on activation */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  /* Profile images from GitHub raw CDN → cache-first */
  if (url.hostname === 'raw.githubusercontent.com') {
    e.respondWith(
      caches.open(CACHE).then(async c => {
        const cached = await c.match(e.request);
        if (cached) return cached;
        const res = await fetch(e.request);
        if (res.ok) c.put(e.request, res.clone());
        return res;
      })
    );
    return;
  }

  /* Cloudflare proxy API calls → network-only (app handles caching via localStorage) */
  if (url.hostname.includes('workers.dev')) return;

  /* App shell and everything else → network-first, cache fallback for offline */
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
