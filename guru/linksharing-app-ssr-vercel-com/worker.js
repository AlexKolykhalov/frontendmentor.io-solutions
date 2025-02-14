// https://github.com/mdn/pwa-examples/blob/main/cycletracker/service_workers/sw.js

const TITLE = "linksharing-api";
const VERSION = "v1";

// The name of the cache
const CACHE_NAME = `${TITLE}-${VERSION}`;

// The static resources that the app needs to function.
const host = "http://localhost:3000";

const APP_STATIC_RESOURCES = [
  `${host}/helpers.js`,
  `${host}/ejs.min.js`,
  `${host}/css/main.css`,
  `${host}/fonts/instrument-sans-bold.woff2`,
  `${host}/fonts/instrument-sans-regular.woff2`,
  `${host}/fonts/instrument-sans-semi-bold.woff2`,
  `${host}/images/illustration-empty.svg`,
  `${host}/images/illustration-phone-mockup.svg`,
  `${host}/images/logo-devlinks-large.svg`,
  `${host}/images/logo-devlinks-small.svg`,
  `${host}/images/icons/clock.svg`,
  `${host}/images/icons/icon-arrow-right.svg`,
  `${host}/images/icons/icon-changes-saved.svg`,
  `${host}/images/icons/icon-chevron-down.svg`,
  `${host}/images/icons/icon-codepen.svg`,
  `${host}/images/icons/icon-codepen-gray.svg`,
  `${host}/images/icons/icon-codewars.svg`,
  `${host}/images/icons/icon-codewars-gray.svg`,
  `${host}/images/icons/icon-devto.svg`,
  `${host}/images/icons/icon-devto-gray.svg`,
  `${host}/images/icons/icon-drag-and-drop.svg`,
  `${host}/images/icons/icon-email.svg`,
  `${host}/images/icons/icon-error.svg`,
  `${host}/images/icons/icon-facebook.svg`,
  `${host}/images/icons/icon-facebook-gray.svg`,
  `${host}/images/icons/icon-freecodecamp.svg`,
  `${host}/images/icons/icon-freecodecamp-gray.svg`,
  `${host}/images/icons/icon-frontend-mentor.svg`,
  `${host}/images/icons/icon-frontend-mentor-gray.svg`,
  `${host}/images/icons/icon-github.svg`,
  `${host}/images/icons/icon-github-gray.svg`,
  `${host}/images/icons/icon-gitlab.svg`,
  `${host}/images/icons/icon-gitlab-gray.svg`,
  `${host}/images/icons/icon-hashnode.svg`,
  `${host}/images/icons/icon-hashnode-gray.svg`,
  `${host}/images/icons/icon-link.svg`,
  `${host}/images/icons/icon-linkedin.svg`,
  `${host}/images/icons/icon-linkedin-gray.svg`,
  `${host}/images/icons/icon-links-header.svg`,
  `${host}/images/icons/icon-link-copied-to-clipboard.svg`,
  `${host}/images/icons/icon-logout.svg`,
  `${host}/images/icons/icon-password.svg`,
  `${host}/images/icons/icon-preview-header.svg`,
  `${host}/images/icons/icon-profile-details-header.svg`,
  `${host}/images/icons/icon-stack-overflow.svg`,
  `${host}/images/icons/icon-stack-overflow-gray.svg`,
  `${host}/images/icons/icon-twitch.svg`,
  `${host}/images/icons/icon-twitch-gray.svg`,
  `${host}/images/icons/icon-twitter.svg`,
  `${host}/images/icons/icon-twitter-gray.svg`,
  `${host}/images/icons/icon-upload-image.svg`,
  `${host}/images/icons/icon-youtube.svg`,
  `${host}/images/icons/icon-youtube-gray.svg`,  
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
	// if (response) return response;
	// if (new URL(event.request.url).pathname === "/link") {
	  
	// };
	// return fetch(event.request);

	// // Return the cached response if found, otherwise fetch from the network
	return response || fetch(event.request);
      })
  );
});
