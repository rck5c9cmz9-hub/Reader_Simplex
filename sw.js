/* Vital Reader offline cache: the page itself and the ebook library.
   Page: network first (so updates arrive), cache when offline. Library: cache first. */
const CACHE = "vital-reader-v1";
const LIB = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", LIB])).catch(() => {}));
});
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match("./")))
    );
  } else if (req.url === LIB) {
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
  }
});
