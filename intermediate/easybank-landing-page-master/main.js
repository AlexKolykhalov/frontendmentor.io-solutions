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
    } else {
        closeMobileNavBar();
    }
});

// ************************* 2. Functions *******************************//

function closeMobileNavBar() {
    headerNavList?.setAttribute('data-visible', 'false');
    headerNavBtn?.setAttribute('aria-expanded', 'false');

    const shadow = document.querySelector('.shadow');
    if (shadow) {
        shadow.setAttribute('data-visible', 'false');
    }
    const list = document.querySelectorAll('[tabindex="-1"]');
    list.forEach(elem => {
        elem.removeAttribute('tabindex');
        elem.removeAttribute('style');
    });
}

function openMobileNavBar() {
    headerNavList?.removeAttribute('data-visible');
    headerNavBtn?.setAttribute('aria-expanded', 'true');

    const shadow = document.querySelector('.shadow');
    if (shadow) {
        shadow.removeAttribute('data-visible');
    }
    const list = document.querySelectorAll('a:not(.header-nav-list a), button:not(nav button)');
    list.forEach(elem => {
        elem.setAttribute('tabindex', '-1');
        elem.setAttribute('style', 'pointer-events: none');
    });
}