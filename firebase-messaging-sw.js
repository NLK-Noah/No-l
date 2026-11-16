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

firebase.messaging().onBackgroundMessage(payload => {
  const data = payload.data || {};
  const notification = payload.notification || {};
  const title = data.title || notification.title || "Le Festin d'Hiver 🎄";

  return self.registration.showNotification(title, {
    body: data.body || notification.body || "Tu as reçu un nouveau message.",
    icon: './static/png/apple-touch-icon.png',
    badge: './static/png/apple-touch-icon.png',
    tag: data.tag || undefined,
    data: { url: data.url || './menu.html' }
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const requestedUrl = event.notification.data?.url || './menu.html';
  const requestedTarget = new URL(requestedUrl, self.registration.scope);
  const targetUrl = requestedTarget.origin === self.location.origin
    ? requestedTarget.href
    : new URL('./menu.html', self.registration.scope).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async clientList => {
      const existingClient = clientList.find(client => client.url === targetUrl);
      if (existingClient) return existingClient.focus();

      const sameOriginClient = clientList.find(client => new URL(client.url).origin === self.location.origin);
      if (sameOriginClient) {
        await sameOriginClient.navigate(targetUrl);
        return sameOriginClient.focus();
      }

      return clients.openWindow(targetUrl);
    })
  );
});
