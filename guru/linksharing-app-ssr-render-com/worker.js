// https://github.com/mdn/pwa-examples/blob/main/cycletracker/service_workers/sw.js

const TITLE = "linksharing-api";
const VERSION = "v1";

// The name of the cache
const CACHE_NAME = `${TITLE}-${VERSION}`;

// The static resources that the app needs to function.
const path = "http://localhost:3000";

const APP_STATIC_RESOURCES = [
  `${path}/public/helpers.js`,
  `${path}/public/html/400.html`,
  `${path}/public/html/404.html`,
  `${path}/public/html/login.html`,
  `${path}/public/html/signup.html`,
  `${path}/public/css/main.css`,
  `${path}/public/js/index.js`,
  `${path}/public/js/login.js`,
  `${path}/public/js/preview.js`,
  `${path}/public/js/signup.js`,
  `${path}/public/fonts/instrument-sans-bold.woff2`,
  `${path}/public/fonts/instrument-sans-regular.woff2`,
  `${path}/public/fonts/instrument-sans-semi-bold.woff2`,
  `${path}/public/images/illustration-empty.svg`,
  `${path}/public/images/illustration-phone-mockup.svg`,
  `${path}/public/images/logo-devlinks-large.svg`,
  `${path}/public/images/logo-devlinks-small.svg`,
  `${path}/public/images/icons/clock.svg`,
  `${path}/public/images/icons/icon-arrow-right.svg`,
  `${path}/public/images/icons/icon-changes-saved.svg`,
  `${path}/public/images/icons/icon-chevron-down.svg`,
  `${path}/public/images/icons/icon-codepen.svg`,
  `${path}/public/images/icons/icon-codepen-gray.svg`,
  `${path}/public/images/icons/icon-codewars.svg`,
  `${path}/public/images/icons/icon-codewars-gray.svg`,
  `${path}/public/images/icons/icon-devto.svg`,
  `${path}/public/images/icons/icon-devto-gray.svg`,
  `${path}/public/images/icons/icon-drag-and-drop.svg`,
  `${path}/public/images/icons/icon-email.svg`,
  `${path}/public/images/icons/icon-error.svg`,
  `${path}/public/images/icons/icon-facebook.svg`,
  `${path}/public/images/icons/icon-facebook-gray.svg`,
  `${path}/public/images/icons/icon-freecodecamp.svg`,
  `${path}/public/images/icons/icon-freecodecamp-gray.svg`,
  `${path}/public/images/icons/icon-frontend-mentor.svg`,
  `${path}/public/images/icons/icon-frontend-mentor-gray.svg`,
  `${path}/public/images/icons/icon-github.svg`,
  `${path}/public/images/icons/icon-github-gray.svg`,
  `${path}/public/images/icons/icon-gitlab.svg`,
  `${path}/public/images/icons/icon-gitlab-gray.svg`,
  `${path}/public/images/icons/icon-hashnode.svg`,
  `${path}/public/images/icons/icon-hashnode-gray.svg`,
  `${path}/public/images/icons/icon-link.svg`,
  `${path}/public/images/icons/icon-linkedin.svg`,
  `${path}/public/images/icons/icon-linkedin-gray.svg`,
  `${path}/public/images/icons/icon-links-header.svg`,
  `${path}/public/images/icons/icon-link-copied-to-clipboard.svg`,
  `${path}/public/images/icons/icon-logout.svg`,
  `${path}/public/images/icons/icon-password.svg`,
  `${path}/public/images/icons/icon-preview-header.svg`,
  `${path}/public/images/icons/icon-profile-details-header.svg`,
  `${path}/public/images/icons/icon-stack-overflow.svg`,
  `${path}/public/images/icons/icon-stack-overflow-gray.svg`,
  `${path}/public/images/icons/icon-twitch.svg`,
  `${path}/public/images/icons/icon-twitch-gray.svg`,
  `${path}/public/images/icons/icon-twitter.svg`,
  `${path}/public/images/icons/icon-twitter-gray.svg`,
  `${path}/public/images/icons/icon-upload-image.svg`,
  `${path}/public/images/icons/icon-youtube.svg`,
  `${path}/public/images/icons/icon-youtube-gray.svg`,
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
        // Return the cached response if found, otherwise fetch from the network
        return response || fetch(event.request);
      })
  );
});
