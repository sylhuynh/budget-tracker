// TODO: implement service worker so that users can use the app offline. The SW
// will need to cache static assets to display the app offline. Additionally,
// the SW should cache transaction data, using the cached data as a fallback
// when the app is used offline. HINT: You should use two caches. One for the
// static assets such ass html, css, js, images, etc; and another cache for
// the dynamic data from requests to routes beginning with "/api".
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/manifest.json",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/db.js",
    "/index.js",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
  ];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener("install", (evt) => {
    evt.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        console.log("Your files were pre-cached successfully!");
        return cache.addAll(FILES_TO_CACHE);
      })
    );
    self.skipWaiting();
  });
  
  self.addEventListener("activate", (evt) => {
    evt.waitUntil(
      caches.keys().then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });
  
  self.addEventListener("fetch", (evt) => {
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then((cache) => {
            return fetch(evt.request)
              .then((response) => {
                if (response.status === 200) {
                  cache.put(evt.request.url, response.clone());
                }
  
                return response;
              })
              .catch(() => {
                return cache.match(evt.request);
              });
          })
          .catch((err) => console.log(err))
      );
      return;
    }
  
    evt.respondWith(
      caches.match(evt.request).then((response) => {
        return response || fetch(evt.request);
      })
    );
  });
