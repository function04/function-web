const CACHE_VERSION = "v1.0.0";
const CACHE_NAME = `function-${CACHE_VERSION}`;

// Install: cache app shell
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate: clean old caches + notify clients of update
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("function-") && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    ).then(() => {
      // Notify all clients that an update is available
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "SW_UPDATED" });
        });
      });
      return self.clients.claim();
    })
  );
});

// Fetch: network-first for API, cache-first for static
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and PocketBase API calls
  if (event.request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;
  if (url.hostname !== self.location.hostname) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline fallback from cache
        return caches.match(event.request);
      })
  );
});
