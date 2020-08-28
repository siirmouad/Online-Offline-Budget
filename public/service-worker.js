const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/icons/icon-512x512.png",
  "/icons/icon-192x192.png",
  "/db.js",
  "/manifest.json",
  "/styles.css",
  "/service-worker.js",
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// registers service worker
self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Your files were pre-cached successfully!");
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", function (evt) {
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

// cache responses for requests for data - opens the data cache
self.addEventListener("fetch", function (evt) {
  if (evt.request.url.includes("/api")) {
    console.log("[Service Worker] Fetch (data)", evt.request.url);
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(evt.request)
          .then((response) => {
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }
            return response;
          })
          .catch((err) => {
            return cache.match(evt.request);
          });
      })
    );
    return;
  }
  evt.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(evt.request).then((response) => {
        return response || fetch(evt.request);
      });
    })
  );
});

// const FILES_TO_CACHE = [
//   "/",
//   "/index.html",
//   "/index.js",
//   "/icons/icon-512x512.png",
//   "/icons/icon-192x192.png",
//   "/db.js",
//   "/manifest.json",
//   "/styles.css",
//   "/service-worker.js",
// ];

// const CACHE_NAME = "static-cache";
// const DATA_CACHE_NAME = "data-cache";

// self.addEventListener("install", function (ev) {
//   ev.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => {
//       console.log("Pre-cache successful");
//       return cache.addAll(TO_CACHE);
//     })
//   );

//   self.skipWaiting();
// });

// self.addEventListener("activate", function (ev) {
//   ev.waitUntil(
//     caches.keys().then((keyList) => {
//       return Promise.all(
//         keyList.map((key) => {
//           if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
//             console.log("Removing old cache data", key);
//             return caches.delete(key);
//           }
//         })
//       );
//     })
//   );
//   self.clients.claim();
// });

// self.addEventListener("fetch", function (ev) {
//   if (ev.request.url.includes("/api/")) {
//     ev.respondWith(
//       caches
//         .open(DATA_CACHE_NAME)
//         .then((cache) => {
//           return fetch(ev.request)
//             .then((response) => {
//               // If the response was good, clone it and store it in the cache.
//               if (response.status === 200) {
//                 cache.put(ev.request.url, response.clone());
//               }

//               return response;
//             })
//             .catch((err) => {
//               console.log(err);
//               return cache.match(ev.request);
//             });
//         })
//         .catch((err) => console.log(err))
//     );

//     return;
//   }

//   ev.respondWith(
//     caches.match(ev.request).then(function (response) {
//       return response || fetch(ev.request);
//     })
//   );
// });
