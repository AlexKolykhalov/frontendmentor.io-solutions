// https://github.com/mdn/pwa-examples/blob/main/cycletracker/service_workers/sw.js

// The version of the cache.
const TITLE = "rock-paper-scissors";

// The version of the cache.
const VERSION = "v1";

// The name of the cache
const CACHE_NAME = `${TITLE}-${VERSION}`;

// The static resources that the app needs to function.
const path = '/frontendmentor.io-solutions/advanced/rock-paper-scissors-master';
// const path = '/advanced/rock-paper-scissors-master';

const APP_STATIC_RESOURCES = [
    `${path}/`,
    `${path}/index.html`,
    `${path}/style.css`,
    `${path}/main.js`,
    `${path}/manifest.json`,
    `${path}/fonts/BarlowSemiCondensed-Bold.woff`,
    `${path}/fonts/BarlowSemiCondensed-Bold.woff2`,
    `${path}/fonts/BarlowSemiCondensed-SemiBold.woff`,
    `${path}/fonts/BarlowSemiCondensed-SemiBold.woff2`,
    `${path}/images/bg-pentagon.svg`,
    `${path}/images/bg-triangle.svg`,
    `${path}/images/favicon-32x32.png`,
    `${path}/images/icon-lizard.svg`,
    `${path}/images/icon-paper.svg`,
    `${path}/images/icon-rock.svg`,
    `${path}/images/icon-scissors.svg`,
    `${path}/images/icon-spock.svg`,
    `${path}/images/icon-close.svg`,
    `${path}/images/image-rules-bonus.svg`,
    `${path}/images/image-rules.svg`,
    `${path}/images/king-crown-default.svg`,
    `${path}/images/king-crown-gold.svg`,
    `${path}/images/logo-bonus.svg`,
    `${path}/images/logo.svg`,
    `${path}/images/refresh.svg`,
    `${path}/images/128.png`,
    `${path}/images/192.png`,
    `${path}/images/512.png`,
    `${path}/images/maskable128.png`,
    `${path}/images/maskable192.png`,
    `${path}/images/maskable512.png`,
];

// On install, cache the static resources
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                APP_STATIC_RESOURCES.forEach((item) => {
                    cache.add(item).catch(_ => console.log(`can't load item`));
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
