const CACHE_NAME = 'adriano-lpo-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.css',
  '/bg-central.png',
  '/hero-v2.png',
  '/hero-agenda.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retorna cache se disponível, senão busca na rede
      return response || fetch(event.request);
    })
  );
});
