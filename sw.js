// ========================================
// SERVICE WORKER - Caché Inteligente
// ========================================

const CACHE_NAME = 'emercado-v1';
const CACHE_API_NAME = 'emercado-api-v1';
const CACHE_IMAGES_NAME = 'emercado-images-v1';

// Assets estáticos para cachear (cache-first)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/bootstrap.min.css',
  '/css/variables.css',
  '/css/styles.css',
  '/css/home.css',
  '/css/cart.css',
  '/css/categories.css',
  '/css/checkout.css',
  '/css/my-profile.css',
  '/css/order-confirmation.css',
  '/js/bootstrap.bundle.min.js',
  '/js/init.js',
  '/img/logo-jap.svg'
];

// URLs de API para cachear temporalmente (network-first)
const API_URLS = [
  'https://japceibal.github.io/emercado-api'
];

// ========================================
// INSTALL - Cachear assets estáticos
// ========================================
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando assets estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()) // Activar inmediatamente
      .catch((error) => {
        console.error('[SW] Error al cachear assets:', error);
      })
  );
});

// ========================================
// ACTIVATE - Limpiar cachés antiguos
// ========================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Eliminar cachés viejos
            if (cacheName !== CACHE_NAME && 
                cacheName !== CACHE_API_NAME && 
                cacheName !== CACHE_IMAGES_NAME) {
              console.log('[SW] Eliminando caché antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim()) // Tomar control inmediato
  );
});

// ========================================
// FETCH - Estrategias de caché
// ========================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ========================================
  // 1. API Requests - Network First (con fallback a caché)
  // ========================================
  if (url.origin === 'https://japceibal.github.io') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachear respuesta exitosa
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_API_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Si falla la red, usar caché
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] Usando caché de API (offline):', request.url);
              return cachedResponse;
            }
            // Si no hay caché, retornar error offline
            return new Response(
              JSON.stringify({ error: 'Sin conexión', offline: true }),
              { 
                headers: { 'Content-Type': 'application/json' },
                status: 503
              }
            );
          });
        })
    );
    return;
  }

  // ========================================
  // 2. Imágenes - Cache First (con network fallback)
  // ========================================
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          // Cachear nueva imagen
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

  // ========================================
  // 3. Assets estáticos (CSS, JS) - Cache First
  // ========================================
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
          // Cachear nuevo asset
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

  // ========================================
  // 4. HTML pages - Network First (con fallback a caché)
  // ========================================
  if (request.destination === 'document' || request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachear nueva página
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Si falla, usar caché
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback a index.html offline
            return caches.match('/index.html');
          });
        })
    );
    return;
  }

  // ========================================
  // 5. Default - Network First
  // ========================================
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// ========================================
// BACKGROUND SYNC (opcional para futuro)
// ========================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cart') {
    console.log('[SW] Sincronizando carrito...');
    // Implementar lógica de sincronización
  }
});

// ========================================
// PUSH NOTIFICATIONS (opcional para futuro)
// ========================================
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'eMercado';
  const options = {
    body: data.body || 'Nueva notificación',
    icon: '/img/logo-jap.svg',
    badge: '/img/logo-jap.svg',
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
