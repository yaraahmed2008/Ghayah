const CACHE_NAME = 'ghayah-offline-v2-fonts';
const ASSETS = ['./index.html', './fonts.css', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-192.png', './icon-maskable-512.png', './fonts/noto-sans-arabic-arabic.woff2', './fonts/noto-sans-arabic-latin.woff2', './fonts/noto-sans-arabic-latin-ext.woff2', './fonts/cairo-arabic.woff2', './fonts/cairo-latin.woff2', './fonts/cairo-latin-ext.woff2', './fonts/tajawal-arabic-400.woff2', './fonts/tajawal-latin-400.woff2', './fonts/tajawal-arabic-500.woff2', './fonts/tajawal-latin-500.woff2', './fonts/tajawal-arabic-700.woff2', './fonts/tajawal-latin-700.woff2', './fonts/noto-sans-display-latin.woff2', './fonts/noto-sans-display-latin-ext.woff2', './fonts/arial-narrow-bold.woff2', './fonts/impact.ttf', './fonts/haettenschweiler.ttf'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
