/* Ghayah service worker — network-first updates with offline fallback.
   Optional font/icon files are cached only when successfully requested, so a
   missing optional asset cannot break the service-worker installation. */
const CACHE_NAME = 'ghayah-app-v8-coach27';
const APP_SHELL = ['./', './index.html', './fonts.css', './manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    for (const path of APP_SHELL) {
      try {
        const url = new URL(path, self.registration.scope);
        const response = await fetch(url.href, { cache: 'reload' });
        if (response && response.status === 200) await cache.put(url.href, response.clone());
      } catch (error) {
        // Keep installing even when an optional/offline shell file is unavailable.
      }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith('ghayah-app-') && key !== CACHE_NAME)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      // Prefer GitHub Pages so a published update is not hidden by an old cache.
      const response = await fetch(request, { cache: 'no-cache' });
      if (response && response.status === 200 && (response.type === 'basic' || response.type === 'default')) {
        try { await cache.put(request, response.clone()); } catch (cacheError) { /* serving the network response is still successful */ }
      }
      return response;
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        const appUrl = new URL('./index.html', self.registration.scope).href;
        const appShell = await caches.match(appUrl);
        if (appShell) return appShell;
      }
      return new Response('المحتوى غير متاح دون اتصال بالإنترنت.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  })());
});
