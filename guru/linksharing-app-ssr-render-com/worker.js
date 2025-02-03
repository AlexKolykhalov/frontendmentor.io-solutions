// https://github.com/mdn/pwa-examples/blob/main/cycletracker/service_workers/sw.js

const TITLE = "linksharing-api";
const VERSION = "v1";

// The name of the cache
const CACHE_NAME = `${TITLE}-${VERSION}`;

// The static resources that the app needs to function.
const host = "https://linksharing-app-ssr-render-com.onrender.com";

const APP_STATIC_RESOURCES = [
  `${host}/public/helpers.js`,
  `${host}/public/html/400.html`,
  `${host}/public/html/404.html`,
  `${host}/public/html/login.html`,
  `${host}/public/html/signup.html`,
  `${host}/public/css/main.css`,
  `${host}/public/js/index.js`,
  `${host}/public/js/login.js`,
  `${host}/public/js/preview.js`,
  `${host}/public/js/signup.js`,
  `${host}/public/fonts/instrument-sans-bold.woff2`,
  `${host}/public/fonts/instrument-sans-regular.woff2`,
  `${host}/public/fonts/instrument-sans-semi-bold.woff2`,
  `${host}/public/images/illustration-empty.svg`,
  `${host}/public/images/illustration-phone-mockup.svg`,
  `${host}/public/images/logo-devlinks-large.svg`,
  `${host}/public/images/logo-devlinks-small.svg`,
  `${host}/public/images/icons/clock.svg`,
  `${host}/public/images/icons/icon-arrow-right.svg`,
  `${host}/public/images/icons/icon-changes-saved.svg`,
  `${host}/public/images/icons/icon-chevron-down.svg`,
  `${host}/public/images/icons/icon-codepen.svg`,
  `${host}/public/images/icons/icon-codepen-gray.svg`,
  `${host}/public/images/icons/icon-codewars.svg`,
  `${host}/public/images/icons/icon-codewars-gray.svg`,
  `${host}/public/images/icons/icon-devto.svg`,
  `${host}/public/images/icons/icon-devto-gray.svg`,
  `${host}/public/images/icons/icon-drag-and-drop.svg`,
  `${host}/public/images/icons/icon-email.svg`,
  `${host}/public/images/icons/icon-error.svg`,
  `${host}/public/images/icons/icon-facebook.svg`,
  `${host}/public/images/icons/icon-facebook-gray.svg`,
  `${host}/public/images/icons/icon-freecodecamp.svg`,
  `${host}/public/images/icons/icon-freecodecamp-gray.svg`,
  `${host}/public/images/icons/icon-frontend-mentor.svg`,
  `${host}/public/images/icons/icon-frontend-mentor-gray.svg`,
  `${host}/public/images/icons/icon-github.svg`,
  `${host}/public/images/icons/icon-github-gray.svg`,
  `${host}/public/images/icons/icon-gitlab.svg`,
  `${host}/public/images/icons/icon-gitlab-gray.svg`,
  `${host}/public/images/icons/icon-hashnode.svg`,
  `${host}/public/images/icons/icon-hashnode-gray.svg`,
  `${host}/public/images/icons/icon-link.svg`,
  `${host}/public/images/icons/icon-linkedin.svg`,
  `${host}/public/images/icons/icon-linkedin-gray.svg`,
  `${host}/public/images/icons/icon-links-header.svg`,
  `${host}/public/images/icons/icon-link-copied-to-clipboard.svg`,
  `${host}/public/images/icons/icon-logout.svg`,
  `${host}/public/images/icons/icon-password.svg`,
  `${host}/public/images/icons/icon-preview-header.svg`,
  `${host}/public/images/icons/icon-profile-details-header.svg`,
  `${host}/public/images/icons/icon-stack-overflow.svg`,
  `${host}/public/images/icons/icon-stack-overflow-gray.svg`,
  `${host}/public/images/icons/icon-twitch.svg`,
  `${host}/public/images/icons/icon-twitch-gray.svg`,
  `${host}/public/images/icons/icon-twitter.svg`,
  `${host}/public/images/icons/icon-twitter-gray.svg`,
  `${host}/public/images/icons/icon-upload-image.svg`,
  `${host}/public/images/icons/icon-youtube.svg`,
  `${host}/public/images/icons/icon-youtube-gray.svg`,
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
