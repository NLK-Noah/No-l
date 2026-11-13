importScripts(
  'https://www.gstatic.com/firebasejs/12.6.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging-compat.js'
);

firebase.initializeApp({
  apiKey: "AIzaSyBVQh_y9U1D5gA7BmCCFJgOlEPlUAogxV8",
  authDomain: "santa-secret-3c1f4.firebaseapp.com",
  projectId: "santa-secret-3c1f4",
  storageBucket: "santa-secret-3c1f4.firebasestorage.app",
  messagingSenderId: "238129661360",
  appId: "1:238129661360:web:d6ccb73539dc67d9f68275"
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage(payload => {
  const data = payload.data || {};
  const title = data.title || "Le Festin d'Hiver 🎄";
  return self.registration.showNotification(title, {
    body: data.body || "Tu as reçu un nouveau message.",
    icon: './static/png/apple-touch-icon.png',
    badge: './static/png/apple-touch-icon.png',
    data: { url: data.url || './menu.html' },
    tag: data.tag || undefined,
    vibrate: [200, 100, 200]
  });
});

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

// --- GESTION DES NOTIFICATIONS PUSH (iOS 16.4+ & Android / Desktop) ---
self.addEventListener('push', event => {
  let data = {
    title: "Le Festin d'Hiver 🎄",
    body: "Une nouvelle surprise t'attend sur l'application de Noël !",
    icon: './static/png/apple-touch-icon.png',
    badge: './static/png/apple-touch-icon.png',
    url: './menu.html'
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      if (payload.from && payload.data) return;
      data = Object.assign(data, payload);
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || './static/png/apple-touch-icon.png',
    badge: data.badge || './static/png/apple-touch-icon.png',
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: data.url || './menu.html'
    },
    actions: [
      { action: 'open', title: 'Ouvrir 🎁' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const requestedUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : './menu.html';
  const requestedTarget = new URL(requestedUrl, self.registration.scope);
  const targetUrl = requestedTarget.origin === self.location.origin
    ? requestedTarget.href
    : new URL('./menu.html', self.registration.scope).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        return client.navigate(targetUrl).then(() => client.focus());
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
