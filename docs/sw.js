const CACHE_NAME="2024-03-08 09:30",urlsToCache=["/grament/","/grament/index.js","/grament/mp3/bgm.mp3","/grament/mp3/cat.mp3","/grament/mp3/correct3.mp3","/grament/mp3/end.mp3","/grament/mp3/keyboard.mp3","/grament/favicon/favicon.svg","https://marmooo.github.io/fonts/textar-light.woff2"];self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(e=>e.addAll(urlsToCache)))}),self.addEventListener("fetch",e=>{e.respondWith(caches.match(e.request).then(t=>t||fetch(e.request)))}),self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(e=>Promise.all(e.filter(e=>e!==CACHE_NAME).map(e=>caches.delete(e)))))})