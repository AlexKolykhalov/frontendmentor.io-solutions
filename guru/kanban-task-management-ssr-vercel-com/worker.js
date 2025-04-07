// https://github.com/mdn/pwa-examples/blob/main/cycletracker/service_workers/sw.js

const TITLE = "kanban-task-management";
const VERSION = "v1";

// The name of the cache
const CACHE_NAME = `${TITLE}-${VERSION}`;

// The static resources that the app needs to function.
const host = "https://localhost:3000";

const APP_STATIC_RESOURCES = [
  `${host}/helpers.js`,
  `${host}/ejs.min.js`,
  `${host}/css/main.css`,
  `${host}/fonts/instrument-sans-bold.woff2`,
  `${host}/fonts/instrument-sans-regular.woff2`,
  `${host}/fonts/instrument-sans-semi-bold.woff2`,
  `${host}/images/svg/drag-handle.svg`,
  `${host}/images/svg/icon-add-task-mobile.svg`,
  `${host}/images/svg/icon-board-purple.svg`,
  `${host}/images/svg/icon-board-white.svg`,
  `${host}/images/svg/icon-board.svg`,
  `${host}/images/svg/icon-check.svg`,
  `${host}/images/svg/icon-chevron-down.svg`,
  `${host}/images/svg/icon-chevron-up.svg`,
  `${host}/images/svg/icon-cross.svg`,
  `${host}/images/svg/icon-dark-theme.svg`,
  `${host}/images/svg/icon-hide-sidebar-purple.svg`,
  `${host}/images/svg/icon-hide-sidebar.svg`,
  `${host}/images/svg/icon-light-theme.svg`,
  `${host}/images/svg/icon-show-sidebar.svg`,
  `${host}/images/svg/icon-vertical-ellipsis.svg`,
  `${host}/images/svg/logo-dark.svg`,
  `${host}/images/svg/logo-light.svg`,
  `${host}/images/svg/logo-mobile.svg`,
  `${host}/pages/login/login.js`,  
  `${host}/pages/signup/signup.js`,
  `${host}/pages/index/index.js`,  
  `${host}/pages/preview/preview.js`,
  `${host}/pages/index/_components/link.ejs`,
  `${host}/pages/index/_components/badge.ejs`,
];

// On install, cache the static resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        APP_STATIC_RESOURCES.forEach((item) => {
          cache.add(item).catch(_ => console.log(`can't load ${item}`));
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
