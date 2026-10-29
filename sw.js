/* Geon service worker: 전 파일을 캐시해 오프라인으로 동작한다.
   파일을 바꾸거나 모듈을 추가하면 CACHE 이름(버전)을 올리고 FILES 목록을 갱신한다. */
var CACHE = 'geon-1.7';
var FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './modules/bjt.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];
self.addEventListener('install', function (e) {
  // cache: 'reload' = 브라우저 HTTP 캐시를 거치지 않고 서버에서 새로 받는다(옛 파일이 새 버전 캐시에 섞이는 것 방지)
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(FILES.map(function (u) { return new Request(u, { cache: 'reload' }); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      if (e.request.mode === 'navigate') return caches.match('./index.html');
      return fetch(e.request);
    })
  );
});
