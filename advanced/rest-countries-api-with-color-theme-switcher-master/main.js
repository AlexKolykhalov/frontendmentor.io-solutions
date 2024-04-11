// @ts-check

/**
 * @type {HTMLButtonElement|null}
 */
const darkModeBtn = document.querySelector('.dark-mode-btn');

/**
 * @type {HTMLButtonElement|null}
 */
const clearSearchBtn = document.querySelector('.clear-btn');

/**
 * @type {HTMLSelectElement|null}
 */
const filter = document.querySelector('.filter-element select');

/**
 * @type {HTMLInputElement|null}
 */
const inputSearch = document.querySelector('input[type="search"]');

/**
 * Pagination step.
 * By deafult is 8.
 * @type {number}
 */
const pagination = 8;

/**
 * @type {number}
 */
let currentIndex = 0;

/**
 * @typedef {object} CacheData
 * @property {Array<object>} world
 * @property {Array<object>} africa
 * @property {Array<object>} america
 * @property {Array<object>} asia
 * @property {Array<object>} europe
 * @property {Array<object>} oceania
 * @property {Array<object>} currentRegion
 * @property {Array<object>} filteringResult Countries with appling filter and search.
 */

/**
 * @type {CacheData|null}
 */
let cache = null;

// ************************** 1. Events *********************************//

window.addEventListener('load', async () => {
    //PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js');
    }

    const colorScheme = localStorage.getItem('color-scheme');
    if (colorScheme) {
        setTheme(colorScheme);
    } else {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches === true) {
            setTheme('dark');
            localStorage.setItem('color-scheme', 'dark');
        } else {
            setTheme('light');
            localStorage.setItem('color-scheme', 'light');
        }
    }
    const url = window.location;
    const destination = url.pathname.substring(url.pathname.lastIndexOf('/'), url.pathname.length);
    await caching();
    if (cache) {
        if (destination === '/' || destination === '/index.html') {
            const sessionFilter = sessionStorage.getItem('filter');
            if (sessionFilter && filter) {
                filter.value = sessionFilter;
                if (sessionFilter === 'Africa') cache.currentRegion = cache.africa;
                if (sessionFilter === 'America') cache.currentRegion = cache.america;
                if (sessionFilter === 'Asia') cache.currentRegion = cache.asia;
                if (sessionFilter === 'Europe') cache.currentRegion = cache.europe;
                if (sessionFilter === 'Oceania') cache.currentRegion = cache.oceania;
                cache.filteringResult = cache.currentRegion;
            }
            const sessionSearch = sessionStorage.getItem('search');
            if (sessionSearch && inputSearch) {
                inputSearch.value = sessionSearch;
                cache.filteringResult = getCountriesByName(cache.currentRegion, sessionSearch);
            }
            fillInTheMainPage(cache.filteringResult);
        }
        if (destination === '/detail.html') {
            const urlParams = new URLSearchParams(url.search);
            const alpha3Code = urlParams.get('country');
            if (alpha3Code) {
                fillInTheDetailPage(cache.currentRegion, alpha3Code);
            }
        }
    }
});

window.addEventListener('scroll', () => {
    const rootElement = document.documentElement;
    const scroll = rootElement.scrollHeight - rootElement.clientHeight;
    if (cache && currentIndex !== cache.filteringResult.length && (rootElement.scrollTop / scroll) > 0.8) {
        fillInTheMainPage(cache.filteringResult);
    }
});

darkModeBtn?.addEventListener('click', () => {
    const body = document.querySelector('body');
    if (body) {
        if (body.getAttribute('data-theme') === 'dark') {
            setTheme('light');
            localStorage.setItem('color-scheme', 'light');
        } else {
            setTheme('dark');
            localStorage.setItem('color-scheme', 'dark');
        }
    }
});

clearSearchBtn?.addEventListener('click', () => {
    if (cache && inputSearch) {
        inputSearch.value = '';
        cache.filteringResult = cache.currentRegion;
        sessionStorage.removeItem('search');
        fillInTheMainPage(cache.filteringResult, true);
    }
});

inputSearch?.addEventListener('input', () => {
    if (cache) {
        cache.filteringResult = getCountriesByName(cache.currentRegion, inputSearch.value);
        fillInTheMainPage(cache.filteringResult, true);
        sessionStorage.setItem('search', inputSearch.value);
    }
});

filter?.addEventListener('change', () => {
    if (cache) {
        if (filter.value === 'World') cache.currentRegion = cache.world;
        if (filter.value === 'Africa') cache.currentRegion = cache.africa;
        if (filter.value === 'America') cache.currentRegion = cache.america;
        if (filter.value === 'Asia') cache.currentRegion = cache.asia;
        if (filter.value === 'Europe') cache.currentRegion = cache.europe;
        if (filter.value === 'Oceania') cache.currentRegion = cache.oceania;
        cache.filteringResult = cache.currentRegion;
        if (inputSearch) {
            cache.filteringResult = getCountriesByName(cache.currentRegion, inputSearch.value);
        }
        fillInTheMainPage(cache.filteringResult, true);
        if (filter.value === 'World') {
            filter.selectedIndex = 0;
            sessionStorage.removeItem('filter');
        } else {
            sessionStorage.setItem('filter', filter.value);
        }
    }
});

// ************************* 2. Functions *******************************//

/**
 * @param {string} theme Available values: 'light' and 'dark'
 */
function setTheme(theme) {
    if (darkModeBtn) {
        const body = document.querySelector('body');
        const img = darkModeBtn.querySelector('img');
        if (body && img) {
            if (theme == 'dark') {
                img.src = 'images/moon-dark.svg';
                body.setAttribute('data-theme', 'dark');
                if (clearSearchBtn) {
                    const imgClearSearch = clearSearchBtn.querySelector('img');
                    if (imgClearSearch) imgClearSearch.src = 'images/clear-dark.svg';
                }
            } else {
                img.src = 'images/moon-light.svg';
                body.setAttribute('data-theme', 'light');
                if (clearSearchBtn) {
                    const imgClearSearch = clearSearchBtn.querySelector('img');
                    if (imgClearSearch) imgClearSearch.src = 'images/clear-light.svg';
                }
            }
        }
    }
}

/**
 * Caching data from `data.json` file.
 */
async function caching() {
    try {
        const response = await fetch('data.json');
        const raw = await response.json();
        let africa = [];
        let america = [];
        let asia = [];
        let europe = [];
        let oceania = [];
        let unknown = [];
        for (let index = 0; index < raw.length; index++) {
            const element = raw[index];
            if (element.region === 'Africa') africa.push(element)
            else if (element.region === 'Americas') america.push(element);
            else if (element.region === 'Asia') asia.push(element);
            else if (element.region === 'Europe') europe.push(element);
            else if (element.region === 'Oceania') oceania.push(element);
            else unknown.push(element);
        }
        cache = {
            world: raw,
            africa: africa,
            america: america,
            asia: asia,
            europe: europe,
            oceania: oceania,
            currentRegion: raw,
            filteringResult: raw,
        };
    } catch (error) {
        page404();
    }
}

/**
 * @param {object} data
 * @param {boolean} clearBefore Clear all elements before filling. `False` by default.
 */
function fillInTheMainPage(data, clearBefore = false) {
    const countryList = document.querySelector('.country-list');
    if (countryList) {
        if (clearBefore) {
            countryList.innerHTML = '';
            currentIndex = 0;
        }
        let listElements = ['<li></li>', '<li></li>', '<li></li>', '<li></li>'];
        let listIndex = 0;
        const limit = (currentIndex + pagination) > data.length ? data.length : currentIndex + pagination;
        for (let index = currentIndex; index < limit; index++) {
            const element = data[index];
            const link =
                `<div class="country-card { column main-axis-space-between clr-bg-element box-shadow-bottom }">
                    <a href="detail.html?country=${element.alpha3Code}" aria-label="${element.name} (see details)"></a>
                    <div class="shimmer-effect" style="height: 200px;">
                        <img class="country-flag" src="${element.flag}" alt="Flag of ${element.name}">
                    </div>
                    <div class="column">
                        <h3 class="fs-600 overflow-ellipsis">${element.name}</h3>
                        <p class="overflow-ellipsis"><span class="fw-semibold">Population:</span>
                            <span>${format(element.population.toString())}</span>
                        </p>
                        <p><span class="fw-semibold">Region:</span> <span>${element.region}</span></p>
                        <p><span class="fw-semibold">Capital:</span> <span>${element.capital}</span></p>
                    </div>
                </div>`;
            listElements[listIndex] = `<li>${link}</li>`;
            listIndex++;
        }
        countryList.insertAdjacentHTML('beforeend', listElements.join(''));
        currentIndex = limit;
    }
}

/**
 * @param {object} data
 * @param {string} alpha3Code
 */
async function fillInTheDetailPage(data, alpha3Code) {
    const country = getCountryByAlpha3Code(data, alpha3Code);
    if (!country) {
        page404();
    }
    if (country) {
        const flag = document.querySelector('.detail-flag');
        const name = document.querySelector('.detail-name');
        const nativeName = document.querySelector('.detail-native-name');
        const population = document.querySelector('.detail-population');
        const region = document.querySelector('.detail-region');
        const subregion = document.querySelector('.detail-sub-region');
        const capital = document.querySelector('.detail-capital');
        const domain = document.querySelector('.detail-domain');
        const currencies = document.querySelector('.detail-currencies');
        const languages = document.querySelector('.detail-languages');
        if (flag &&
            name &&
            nativeName &&
            population &&
            region &&
            subregion &&
            capital &&
            domain &&
            currencies &&
            languages) {

            //@ts-ignore
            flag.src = country.flag;
            //@ts-ignore
            flag.alt = `Flag of ${country.name}`;
            name.textContent = country.name;
            nativeName.textContent = country.nativeName;
            population.textContent = format(country.population.toString());
            region.textContent = country.region;
            subregion.textContent = country.subregion;
            capital.textContent = country.capital;
            domain.textContent = country.topLevelDomain; //array
            currencies.textContent = remap(country.currencies);
            languages.textContent = remap(country.languages);
        }
        if (country.borders && country.borders.length > 0) {
            const detail = document.querySelector('.detail');
            if (detail) {
                let listElements = '';
                country.borders.forEach((border) => {
                    const borderCountry = getCountryByAlpha3Code(data, border);
                    if (borderCountry) {
                        const link =
                            `<a class="pad-h-m pad-v-sm clr-bg-element border-radius-sm box-shadow-bottom" 
                                   href="detail.html?country=${border}">
                                   ${borderCountry.name}
                                </a>`;
                        listElements = listElements + `<li class="mar-bottom-sm">${link}</li>`;
                    }
                });
                const htmlCode =
                    `<div class="row gap-m">
                            <span class="fw-semibold fs-500">Border Countries:</span>
                            <ul class="row gap-m">
                                ${listElements}
                            </ul>
                        </div>`;
                detail.insertAdjacentHTML('beforeend', htmlCode);
            }
        }
    }
}

function page404() {
    const url = window.location.pathname;
    const path = url.substring(0, url.lastIndexOf('/'));
    window.location.replace(`${path}/404.html`);
}

/**
 * @param {object} data
 * @param {string} alpha3Code
 * @returns {Object|undefined}
 */
function getCountryByAlpha3Code(data, alpha3Code) {
    return data.find((element) => element.alpha3Code === alpha3Code);
}

/**
 * @param {object} data
 * @param {string} name
 * @returns {Array}
 */
function getCountriesByName(data, name) {
    return data.filter((element) => element.name.match(new RegExp(name, 'i')) !== null);
}

/**
 * Add `,` between words.
 * @param {Array} array 
 */
function remap(array) {
    let currentLine = '';
    if (array) {
        array.map(e => {
            if (array.indexOf(e) === 0) {
                currentLine = e.name;
            } else {
                currentLine = currentLine + `, ${e.name}`;
            }
        });
    }
    return currentLine;
}

/**
* Returns a formatted string, e.c. '1000'->'1,000'
* @param {string} str
*/
function format(str) {
    return str.replace(/.(?=(...)+$)/g, '$&,');
}