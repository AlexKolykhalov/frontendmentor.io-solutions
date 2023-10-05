// @ts-check

/**
* @type {HTMLButtonElement|null}
*/
const headerNavBtn = document.querySelector('.header-nav-btn');

/**
* @type {HTMLUListElement|null}
*/
const headerNavList = document.querySelector('.header-nav-list');

// ************************** 1. Events *********************************//

window.addEventListener('load', () => {
    headerNavBtn?.removeAttribute('data-visible');
    if (window.matchMedia("(min-width: 48em)").matches) {
        headerNavBtn?.setAttribute('data-visible', 'false');
        headerNavList?.removeAttribute('data-visible');
        setMark();
    }
});

window.addEventListener('resize', () => {
    if (window.matchMedia("(min-width: 48em)").matches) {
        headerNavBtn?.setAttribute('data-visible', 'false');
        headerNavBtn?.setAttribute('aria-expanded', 'false');
        headerNavList?.removeAttribute('data-visible');
    } else {
        headerNavBtn?.removeAttribute('data-visible');
        closeMobileNavBar();
    }
});

headerNavBtn?.addEventListener('click', () => {
    if (headerNavList?.getAttribute('data-visible') === 'false') {
        openMobileNavBar();
        setMark();
    } else {
        closeMobileNavBar();
    }
});

// ************************* 2. Functions *******************************//

function closeMobileNavBar() {
    headerNavList?.setAttribute('data-visible', 'false');
    headerNavBtn?.setAttribute('aria-expanded', 'false');

    const list = document.querySelectorAll('[tabindex="-1"]');
    list.forEach(a => {
        a.removeAttribute('tabindex');
    });
}

function openMobileNavBar() {
    headerNavList?.removeAttribute('data-visible');
    headerNavBtn?.setAttribute('aria-expanded', 'true');

    const list = document.querySelectorAll('a:not(.header-nav-list a), li>button');
    list.forEach(a => {
        a.setAttribute('tabindex', '-1');
    });
}

/**
 * Sets a little right mark from the main content in the mobile navigation bar
 */
function setMark() {
    const currentPath = window.location.pathname;
    let currentPage = headerNavList?.querySelector('li:nth-child(1)');
    if (currentPath === '/frontendmentor.io-solutions/intermediate/space-tourism-website-main/destination.html') {
        currentPage = headerNavList?.querySelector('li:nth-child(2)');
    }
    if (currentPath === '/frontendmentor.io-solutions/intermediate/space-tourism-website-main/crew.html') {
        currentPage = headerNavList?.querySelector('li:nth-child(3)');
    }
    if (currentPath === '/frontendmentor.io-solutions/intermediate/space-tourism-website-main/technology.html') {
        currentPage = headerNavList?.querySelector('li:nth-child(4)');
    }
    currentPage?.setAttribute('data-status', 'active');
}