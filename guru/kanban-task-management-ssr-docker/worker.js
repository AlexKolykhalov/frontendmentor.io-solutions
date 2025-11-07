// https://github.com/mdn/pwa-examples/blob/main/cycletracker/service_workers/sw.js

const TITLE = "some_title";
const VERSION = "v1";

// The name of the cache
const CACHE_NAME = `${TITLE}-${VERSION}`;

// The static resources that the app needs to function.
const host = "https://localhost:3000";

const APP_STATIC_RESOURCES = [
  `${host}/main.css`,
  `${host}/fonts/some-font.woff2`,
  `${host}/images/svg/some_svg.svg`,
  `${host}/pages/_shared/js/add_events.js`,
  `${host}/pages/_shared/js/role.js`,
  `${host}/pages/index/components/some_component.js`,
];

// On install, cache the static resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        APP_STATIC_RESOURCES.forEach((item) => {
          cache.add(item).catch(_ => console.log(`can not load ${item}`));
        });
      })
      .catch((err) => {
        console.log(err);
      })
  );
});

// delete old caches on activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
      await clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
	return response || fetch(event.request);
      })
  );
});
