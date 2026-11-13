/* Generación Verde · guardado en el teléfono
   Sin esto, escanear un stand sin señal no abre nada. */
var CACHE = 'gv-v4';
var SHELL = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  /* las llamadas al buzón NUNCA se guardan: o salen de verdad o fallan de verdad */
  if (u.hostname.indexOf('script.google') >= 0) return;
  if (u.origin !== location.origin) return;

  /* la página se sirve de lo guardado aunque traiga ?s= o ?b= */
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      if (hit) {
        /* de paso la refresca para la próxima vez, sin hacer esperar */
        fetch(e.request).then(function (r) {
          if (r && r.ok) caches.open(CACHE).then(function (c) { c.put('./index.html', r.clone()); });
        }).catch(function () {});
        return hit;
      }
      return fetch(e.request).catch(function () { return caches.match('./index.html'); });
    })
  );
});
