const CACHE_NAME = 'stockranker-cache-v2'; // Update the cache version to ensure updates are fetched
const urlsToCache = [
  '/',
  '/css/style.css',
  '/js/main.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service worker: Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Service worker: Error opening cache during service worker install:', err);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(err => {
                console.error('Service worker: Error opening cache to put new fetched response:', err);
              });

            return response;
          }
        );
      })
      .catch(err => {
        console.error('Service worker: Error fetching and caching new data:', err);
      })
  );
});

// Update a service worker, clearing old cache
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]; // Update the whitelist to only contain the new version

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log(`Service worker: Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName).catch(err => {
              console.error('Service worker: Error deleting old cache:', err);
            });
          }
        })
      );
    })
  );
});