// https://github.com/mdn/pwa-examples/blob/main/cycletracker/service_workers/sw.js

const TITLE = "countries-api";
const VERSION = "v1";

// The name of the cache
const CACHE_NAME = `${TITLE}-${VERSION}`;

// The static resources that the app needs to function.
// const path = '/frontendmentor.io-solutions/advanced/rest-countries-api-with-color-theme-switcher-master';
const path = '/advanced/rest-countries-api-with-color-theme-switcher-master';

const APP_STATIC_RESOURCES = [
    `${path}/`,
    `${path}/index.html`,
    `${path}/style.css`,
    `${path}/main.js`,
    `${path}/manifest.json`,
    `${path}/assets/fonts/Ubuntu-Bold.ttf`,
    `${path}/assets/fonts/Ubuntu-Bold.woff`,
    `${path}/assets/fonts/Ubuntu-Bold.woff2`,
    `${path}/assets/fonts/Ubuntu-Medium.ttf`,
    `${path}/assets/fonts/Ubuntu-Medium.woff`,
    `${path}/assets/fonts/Ubuntu-Medium.woff2`,
    `${path}/assets/fonts/Ubuntu-Regular.ttf`,
    `${path}/assets/fonts/Ubuntu-Regular.woff`,
    `${path}/assets/fonts/Ubuntu-Regular.woff2`,
    `${path}/assets/images/bg-sidebar-desktop.svg`,
    `${path}/assets/images/bg-sidebar-mobile.svg`,
    `${path}/assets/images/favicon-32x32.png`,
    `${path}/assets/images/icon-advanced.svg`,
    `${path}/assets/images/icon-arcade.svg`,
    `${path}/assets/images/icon-checkmark.svg`,
    `${path}/assets/images/icon-pro.svg`,
    `${path}/assets/images/icon-thank-you.svg`,
    `${path}/assets/images/128.png`,
    `${path}/assets/images/192.png`,
    `${path}/assets/images/512.png`,
    `${path}/assets/images/maskable128.png`,
    `${path}/assets/images/maskable192.png`,
    `${path}/assets/images/maskable512.png`,
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

// On fetch, intercept server requests
// and respond with cached responses instead of going to network
self.addEventListener("fetch", (event) => {
    // // As a single page app, direct app to always go to cached home page.
    if (event.request.mode === "navigate") {
        event.respondWith(caches.match(`${path}/`));
        return;
    }

    // For all other requests, go to the cache first, and then the network.
    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(event.request, { ignoreVary: true });
            if (cachedResponse) {
                // Return the cached response if it's available.
                return cachedResponse;
            }
            // If resource isn't in the cache, return a 404.
            return new Response(null, { status: 404 });
        })()
    );
});