const CACHE_NAME = 'futsalpro-v7';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network FIRST — toujours chercher la version fraîche sur le réseau
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'Futsal Pro', body: 'Nouvelle notification' };
  e.waitUntil(self.registration.showNotification(data.title || 'Futsal Pro', {
    body: data.body || '',
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: 'futsal-notif',
    renotify: true
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    const ex = cs.find(c => c.url.includes(self.registration.scope));
    if (ex) { ex.focus(); return; }
    clients.openWindow(self.registration.scope);
  }));
});