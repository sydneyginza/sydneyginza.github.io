const CACHE = 'ginza-v4';
const SHELL = ['/', '/index.html', '/404.html', '/styles.min.css',
  '/js/app.min.js', '/js/analytics.min.js', '/fav-icon.png',
  '/fonts/orbitron-var-latin.woff2',
  '/fonts/rajdhani-400-latin.woff2',
  '/fonts/rajdhani-500-latin.woff2',
  '/fonts/rajdhani-600-latin.woff2'];

/* Image cache has a separate size limit to avoid unbounded growth */
const IMG_CACHE = 'ginza-images-v1';
const IMG_CACHE_MAX = 200;

/* Pre-cache app shell on install */
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

/* Delete old caches on activation */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE && k !== IMG_CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* Trim image cache to prevent unbounded storage growth */
async function trimImageCache() {
  const c = await caches.open(IMG_CACHE);
  const keys = await c.keys();
  if (keys.length > IMG_CACHE_MAX) {
    const toDelete = keys.slice(0, keys.length - IMG_CACHE_MAX);
    await Promise.all(toDelete.map(k => c.delete(k)));
  }
}

/* Push notification handler */
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || 'Ginza Empire';
  const options = {
    body: data.body || '',
    icon: '/fav-icon.png',
    badge: '/fav-icon.png',
    data: { url: data.url || '/roster' },
    tag: 'ginza-avail',
    renotify: true,
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data && e.notification.data.url ? e.notification.data.url : '/roster';
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for (const c of list) {
        if (new URL(c.url).origin === self.location.origin && 'focus' in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  /* Font files → cache-first (immutable content-hashed files) */
  if (url.pathname.startsWith('/fonts/')) {
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

  /* Profile images from GitHub raw CDN → cache-first with size limit */
  if (url.hostname === 'raw.githubusercontent.com') {
    e.respondWith(
      caches.open(IMG_CACHE).then(async c => {
        const cached = await c.match(e.request);
        if (cached) return cached;
        const res = await fetch(e.request);
        if (res.ok) {
          c.put(e.request, res.clone());
          trimImageCache();
        }
        return res;
      })
    );
    return;
  }

  /* Cloudflare proxy API calls → network-only (app handles caching via localStorage) */
  if (url.hostname.includes('workers.dev')) return;

  /* Google Maps → network-only (no caching needed) */
  if (url.hostname.includes('google.com')) return;

  /* App shell and everything else → network-first, cache fallback for offline */
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(cached => {
        /* If no cached response and it's a navigation, serve the cached index */
        if (!cached && e.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return cached;
      }))
  );
});
