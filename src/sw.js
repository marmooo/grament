const CACHE_NAME = "2025-07-18 00:00";
const urlsToCache = [
  "/grament/",
  "/grament/index.js",
  "/grament/mp3/bgm.mp3",
  "/grament/mp3/cat.mp3",
  "/grament/mp3/correct3.mp3",
  "/grament/mp3/end.mp3",
  "/grament/mp3/keyboard.mp3",
  "/grament/favicon/favicon.svg",
  "https://marmooo.github.io/fonts/textar-light.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );
});
