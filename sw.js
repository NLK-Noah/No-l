importScripts('./firebase-messaging-sw.js');

const CACHE_NAME = 'festin-hiver-v3';
const STATIC_ASSETS = [
  './',
  './index.html',
  './menu.html',
  './avent.html',
  './santa.html',
  './resultat.html',
  './rapporte.html',
  './profile.html',
  './manifest.json',
  './static/png/apple-touch-icon.png',
  './static/png/icon-192.png',
  './static/png/icon-512.png',
  './static/png/naima.png',
  './static/png/back.jpeg',
  './static/css/transitions.css',
  './static/css/noel-3d.css'
];

// Installation & mise en cache sécurisée
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`[SW] Impossible de pré-cacher : ${asset}`, err);
        }
      }
    })
  );
});

// Activation & nettoyage des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Stratégie Réseau en priorité avec repli sur le cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Mettre à jour le cache dynamiquement pour les requêtes réussies
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('./menu.html') || caches.match('./index.html');
          }
        });
      })
  );
});
