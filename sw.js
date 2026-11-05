const CACHE_NAME = 'ghayah-offline-v4-stability';
const ASSETS = [
  './index.html', './fonts.css', './manifest.json',
  './icon-192.png', './icon-512.png', './icon-maskable-192.png', './icon-maskable-512.png',
  './fonts/noto-sans-arabic-arabic.woff2', './fonts/noto-sans-arabic-latin.woff2', './fonts/noto-sans-arabic-latin-ext.woff2',
  './fonts/cairo-arabic.woff2', './fonts/cairo-latin.woff2', './fonts/cairo-latin-ext.woff2',
  './fonts/tajawal-arabic-400.woff2', './fonts/tajawal-latin-400.woff2',
  './fonts/tajawal-arabic-500.woff2', './fonts/tajawal-latin-500.woff2',
  './fonts/tajawal-arabic-700.woff2', './fonts/tajawal-latin-700.woff2',
  './fonts/noto-sans-display-latin.woff2', './fonts/noto-sans-display-latin-ext.woff2',
  './fonts/arial-narrow-bold.woff2', './fonts/impact.ttf', './fonts/haettenschweiler.ttf'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

// Network-first for same-origin files: GitHub Pages updates become visible
// while online, while the last successful copy remains available offline.
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request, { cache: 'no-cache' });
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        const appShell = new URL('./index.html', self.registration.scope).href;
        const fallback = await caches.match(appShell);
        if (fallback) return fallback;
      }
      return new Response('المحتوى غير متاح دون اتصال بالإنترنت.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  })());
});
