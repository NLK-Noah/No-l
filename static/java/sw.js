const CACHE_NAME = 'noel-cache-v1';
const assetsToCache = [
  '/menu.html',
  '/index.html',
  '/avent.html',
  '/final.html',
  '/static/css/noel-3d.css',
  '/static/css/global-effects.css',
  '/static/java/noel-ui.js',
  '/static/java/theme.js',
  '/static/java/effects.js',
  '/static/png/naima.png',
  '/static/png/sapin.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assetsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
