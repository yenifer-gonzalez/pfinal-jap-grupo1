// Service Worker para mejorar la velocidad y permitir uso offline

const CACHE_NAME = 'emercado-v1';
const CACHE_API_NAME = 'emercado-api-v1';
const CACHE_IMAGES_NAME = 'emercado-images-v1';

// Archivos que queremos guardar en caché
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/bootstrap.min.css',
  './css/variables.css',
  './css/styles.css',
  './css/home.css',
  './css/cart.css',
  './css/categories.css',
  './css/checkout.css',
  './css/my-profile.css',
  './css/order-confirmation.css',
  './js/bootstrap.bundle.min.js',
  './js/init.js',
  './img/logo-jap.svg',
];

// URLs de la API
const API_URLS = ['https://japceibal.github.io/emercado-api'];

// Cuando se instala, guardamos los archivos en caché
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Guardando archivos en caché');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Error:', error);
      })
  );
});

// Cuando se activa, limpiamos cachés viejos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== CACHE_API_NAME &&
              cacheName !== CACHE_IMAGES_NAME
            ) {
              console.log('[SW] Borrando caché viejo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Interceptamos las peticiones para usar caché cuando sea posible
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Para la API: intentamos red primero, si falla usamos caché
  if (url.origin === 'https://japceibal.github.io') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Guardamos la respuesta en caché
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_API_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Si no hay internet, usamos lo que tenemos en caché
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] Usando caché (sin internet):', request.url);
              return cachedResponse;
            }
            return new Response(JSON.stringify({ error: 'Sin conexión', offline: true }), {
              headers: { 'Content-Type': 'application/json' },
              status: 503,
            });
          });
        })
    );
    return;
  }

  // Para imágenes: primero buscamos en caché, si no hay bajamos de internet
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          // Guardamos la imagen nueva
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_IMAGES_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Para CSS y JS: primero buscamos en caché
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          // Guardamos el archivo nuevo
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Para páginas HTML: intentamos cargar de internet
  if (request.destination === 'document' || request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Guardamos la página
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Si no hay internet, mostramos lo que tenemos
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return caches.match('./index.html');
          });
        })
    );
    return;
  }

  // Para todo lo demás: intentamos internet, si falla usamos caché
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});
