// @ts-check

/**
* @type {HTMLButtonElement|null}
*/
const headerNavBtn = document.querySelector('.header-nav-btn');

/**
* @type {HTMLUListElement|null}
*/
const headerNavList = document.querySelector('.header-nav-list');

/**
* @type {HTMLButtonElement|null}
*/
const btn = document.querySelector('input+button');

/**
* @type {HTMLInputElement|null}
*/
const input = document.querySelector('input');

// ************************** 1. Events *********************************//

window.addEventListener('load', () => {
    const data = localStorage.getItem('shorten-links');
    if (data) {
        const listOfLinks = JSON.parse(data);
        listOfLinks.forEach((elem) => {
            addShortenLink(elem.url, elem.link);
        });
    }

    headerNavBtn?.removeAttribute('data-visible');
    if (window.matchMedia("(min-width: 48em)").matches) {
        headerNavBtn?.setAttribute('data-visible', 'false');
        headerNavList?.removeAttribute('data-visible');
    }
});

window.addEventListener('resize', () => {
    if (window.matchMedia("(min-width: 48em)").matches) {
        headerNavBtn?.setAttribute('data-visible', 'false');
        headerNavBtn?.setAttribute('aria-expanded', 'false');
        headerNavList?.removeAttribute('data-visible');
        // remove `tabindex` attr from `header-nav-list a`
        const list = document.querySelectorAll('[tabindex="-1"]');
        list.forEach(elem => {
            elem.removeAttribute('tabindex');
            elem.removeAttribute('style');
        });
    } else {
        headerNavBtn?.removeAttribute('data-visible');
        closeMobileNavBar();
    }
});

headerNavBtn?.addEventListener('click', () => {
    if (headerNavList?.getAttribute('data-visible') === 'false') {
        openMobileNavBar();
    } else {
        closeMobileNavBar();
    }
});

input?.addEventListener('input', () => {
    input.parentElement?.removeAttribute('data-status');
});

input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim() === '') {
        input.parentElement?.setAttribute('data-status', 'error');
        input.value = '';
    } else if (e.key === 'Enter') {
        const shortenLink = randomPath();
        addShortenLink(input.value, shortenLink);
        addToLocalStorage(input.value, shortenLink)
        input.value = '';
    }
});

btn?.addEventListener('click', () => {
    if (input) {
        if (input.value.trim() === '') {
            input.parentElement?.setAttribute('data-status', 'error');
        } else {
            const shortenLink = randomPath();
            addShortenLink(input.value, shortenLink);
            addToLocalStorage(input.value, shortenLink)
        }
        input.value = '';
    }
});

// ************************* 2. Functions *******************************//

function closeMobileNavBar() {
    headerNavList?.setAttribute('data-visible', 'false');
    headerNavBtn?.setAttribute('aria-expanded', 'false');

    const list1 = document.querySelectorAll('[tabindex="-1"]');
    list1.forEach(elem => {
        elem.removeAttribute('tabindex');
        elem.removeAttribute('style');
    });

    const list2 = document.querySelectorAll('.header-nav-list a');
    list2.forEach(elem => {
        elem.setAttribute('tabindex', '-1');
        elem.setAttribute('style', 'pointer-events: none');
    });
}

function openMobileNavBar() {
    headerNavList?.removeAttribute('data-visible');
    headerNavBtn?.setAttribute('aria-expanded', 'true');

    const list1 = document.querySelectorAll('[tabindex="-1"]');
    list1.forEach(elem => {
        elem.removeAttribute('tabindex');
        elem.removeAttribute('style');
    });

    const list2 = document.querySelectorAll('a:not(.header-nav-list a), button:not(nav button), input');
    list2.forEach(elem => {
        elem.setAttribute('tabindex', '-1');
        elem.setAttribute('style', 'pointer-events: none');
    });
}

/**
 * Adds a new HTML element to the shorten link list.
 * @param {string} url
 * @param {string} shortenLink
 */
function addShortenLink(url, shortenLink) {
    const parentDiv = document.querySelector('#shorten_links_list');
    const template = document.querySelector('#shorten_link_section');
    // @ts-ignore
    const clone = template?.content.firstElementChild?.cloneNode(true);
    if (clone) {
        const title = clone.querySelector('.title');
        const link = clone.querySelector('.shorten-link');
        const copyBnt = clone.querySelector('.badge');
        if (title && link && copyBnt && input) {
            title.textContent = url;
            link.textContent = shortenLink;
            copyBnt.addEventListener('click', () => {
                const listCopiedBtns = document.querySelectorAll('.badge[data-status="copied"]');
                listCopiedBtns.forEach((elem) => {
                    elem.removeAttribute('data-status');
                    elem.textContent = 'Copy';
                });
                input.select();
                input.setSelectionRange(0, 99999);

                navigator.clipboard.writeText(link.textContent);
                copyBnt.textContent = 'Copied!';
                copyBnt.setAttribute('data-status', 'copied');
            });
            parentDiv?.appendChild(clone);
        }
    }
}

/**
 * Create a random fake shorten link.
 */
function randomPath() {
    return `https://rel.ink/${(Math.random() + 1).toString(36).substring(7)}`;
}

/**
 * @param {string} url
 * @param {string} shortenLink
 */
function addToLocalStorage(url, shortenLink) {
    const data = localStorage.getItem('shorten-links');
    let listOfLinks = [];
    if (data) {
        listOfLinks = JSON.parse(data);
    }
    listOfLinks.push({ 'url': url, 'link': shortenLink });
    localStorage.setItem('shorten-links', JSON.stringify(listOfLinks));
}