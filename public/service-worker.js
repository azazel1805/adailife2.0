// A unique cache name for this version of the app.
const CACHE_NAME = 'adai-cache-v1';

// List of assets to cache on installation.
const urlsToCache = [
  '/',
  '/index.html',
  '/adai-favicon.svg',
  '/manifest.json'
];

// Install event: cache the application shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to cache app shell:', err);
      })
  );
});

// Activate event: clean up old caches.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event: serve assets from cache, falling back to network.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests, use a network-first strategy to get the latest HTML.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If the request is in the cache, return it.
        if (response) {
          return response;
        }

        // If the request is not in the cache, fetch it from the network.
        return fetch(event.request).then(
          (response) => {
            // If the fetch was unsuccessful, don't cache anything.
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a stream and can only be consumed once.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // Add the new resource to the cache.
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(err => {
            console.error('Fetch failed; no cache fallback.', err);
            // Intentionally not returning an offline page here, but you could add one.
        });
      })
  );
});