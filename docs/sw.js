var CACHE_NAME="2023-02-16 09:45",urlsToCache=["/grament/","/grament/index.js","/grament/mp3/bgm.mp3","/grament/mp3/cat.mp3","/grament/mp3/correct.mp3","/grament/mp3/end.mp3","/grament/mp3/keyboard.mp3","/grament/index.js","/grament/favicon/favicon.svg","https://marmooo.github.io/fonts/textar-light.woff2","https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css"];self.addEventListener("install",function(a){a.waitUntil(caches.open(CACHE_NAME).then(function(a){return a.addAll(urlsToCache)}))}),self.addEventListener("fetch",function(a){a.respondWith(caches.match(a.request).then(function(b){return b||fetch(a.request)}))}),self.addEventListener("activate",function(a){var b=[CACHE_NAME];a.waitUntil(caches.keys().then(function(a){return Promise.all(a.map(function(a){if(b.indexOf(a)===-1)return caches.delete(a)}))}))})