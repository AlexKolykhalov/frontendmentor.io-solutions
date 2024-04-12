// https://github.com/mdn/pwa-examples/blob/main/cycletracker/service_workers/sw.js

const TITLE = "countries-api";
const VERSION = "v1";

// The name of the cache
const CACHE_NAME = `${TITLE}-${VERSION}`;

// The static resources that the app needs to function.
const path = '/frontendmentor.io-solutions/advanced/rest-countries-api-with-color-theme-switcher-master';
// const path = '/advanced/rest-countries-api-with-color-theme-switcher-master';

const APP_STATIC_RESOURCES = [
    `${path}/`,
    `${path}/index.html`,
    `${path}/offline-detail.html`,
    `${path}/404.html`,
    `${path}/style.css`,
    `${path}/main.js`,
    `${path}/manifest.json`,
    `${path}/data.json`,
    `${path}/fonts/NunitoSans10pt-ExtraBold.woff`,
    `${path}/fonts/NunitoSans10pt-ExtraBold.woff2`,
    `${path}/fonts/NunitoSans10pt-Light.woff`,
    `${path}/fonts/NunitoSans10pt-Light.woff2`,
    `${path}/fonts/NunitoSans10pt-SemiBold.woff`,
    `${path}/fonts/NunitoSans10pt-SemiBold.woff2`,
    `${path}/images/un.svg`,
    `${path}/images/favicon-32x32.png`,
    `${path}/images/arrow-back-dark.svg`,
    `${path}/images/arrow-back-light.svg`,
    `${path}/images/arrow-down-dark.svg`,
    `${path}/images/arrow-down-light.svg`,
    `${path}/images/clear-dark.svg`,
    `${path}/images/clear-light.svg`,
    `${path}/images/moon-dark.svg`,
    `${path}/images/moon-light.svg`,
    `${path}/images/search-dark.svg`,
    `${path}/images/search-light.svg`,
    `${path}/images/icons/128.png`,
    `${path}/images/icons/192.png`,
    `${path}/images/icons/512.png`,
    `${path}/images/icons/maskable128.png`,
    `${path}/images/icons/maskable192.png`,
    `${path}/images/icons/maskable512.png`,
    `${path}/images/screenshots/mobile.png`,
    `${path}/images/screenshots/desktop.png`,
];

// On install, cache the static resources
/**
 * @type {String}
 */
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async (cache) => {
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
    // For all other requests, go to the cache first, and then the network.
    event.respondWith(
        (async () => {
            // go to the Cache.
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(event.request, { ignoreVary: true });
            if (cachedResponse) return cachedResponse;

            try {
                const url = new URL(event.request.url);
                let networkResponse = undefined;
                // go to the Web only for .svg
                if (url.pathname.endsWith('.svg')) {
                    try {
                        networkResponse = await fetch(event.request, { signal: AbortSignal.timeout(4000) });
                    } catch (error) {
                        throw new Error('svg');
                    }
                }
                // or for detail.html
                if (url.pathname.endsWith('detail.html')) {
                    try {
                        networkResponse = await fetch(event.request, { signal: AbortSignal.timeout(4000) });
                    } catch (error) {
                        throw new Error('html');
                    }
                }
                if (networkResponse && networkResponse.status < 400) {
                    return networkResponse;
                }
                // if offline
            } catch (error) {
                let cachedResponse = undefined;
                if (error.message === 'svg') {
                    // returns default .svg
                    cachedResponse = await cache.match(`${path}/images/un.svg`, { ignoreVary: true });
                }
                if (error.message === 'html') {
                    // returns defaul detail.html
                    cachedResponse = await cache.match(`${path}/offline-detail.html`);
                }
                if (cachedResponse) {
                    return cachedResponse;
                }
            }
        })()
    );
});