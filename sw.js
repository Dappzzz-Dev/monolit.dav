/* TAG: sw.js - minimal service worker. Cache-first for hashed/safe static
   assets (OK because production deploys stable .min files), network-first for
   the document so updates ship immediately, stale-while-revalidate for images.
   Versioned so a deploy clears the old cache on next visit. */
const VERSION = 'v1';
const SHELL = [
  './',
  './index.html',
  './css/style.min.css',
  './js/app.min.js',
  './js/i18n.min.js',
  './js/sections.min.js',
  './js/carousel.min.js',
  './js/projects.min.js',
  './js/click-effects.min.js',
  './js/globe.min.js',
  './js/context-menu.min.js',
  './favicon.svg',
  './structured-data.jsonld'
];
const CACHE = 'monolit-' + VERSION;

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);

  // Skip cross-origin (CDN fonts, GSAP, Three.js) - let the network handle them.
  if(url.origin !== self.location.origin){
    // Strategy for images from friendly third parties: stale-while-revalidate.
    if(/\.(png|jpg|jpeg|svg|webp|gif)$/i.test(url.pathname)){
      e.respondWith(staleWhileRevalidate(req));
    }
    return;
  }

  // Documents: network-first so updates show up immediately.
  if(req.mode === 'navigate' || url.pathname.endsWith('/')){
    e.respondWith(networkFirst(req));
    return;
  }

  // Same-origin static assets: cache-first, then network (fallback cache).
  e.respondWith(cacheFirst(req));
});

function cacheFirst(req){
  return caches.match(req).then(hit =>
    hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    })
  );
}

function networkFirst(req){
  return fetch(req).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
    return res;
  }).catch(() => caches.match(req));
}

function staleWhileRevalidate(req){
  return caches.match(req).then(hit => {
    const net = fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => hit);
    return hit || net;
  });
}
