// @ts-check


/**
* @type {HTMLElement|null}
*/
const main = document.querySelector('main');

/**
* @type {HTMLElement|null}
*/
const footer = document.querySelector('footer');

/**
* @type {HTMLButtonElement|null}
*/
const btn = document.querySelector('.header-nav-btn');

/**
* @type {HTMLUListElement|null}
*/
const headerNavList = document.querySelector('.header-nav-list');

// ************************** Events *********************************//

window.addEventListener('load', () => {
    if (window.matchMedia && window.matchMedia("(max-width: 36em)").matches) {
        headerNavList?.setAttribute('data-visible', 'false');
    } else {
        btn?.setAttribute('data-visible', 'false');
    }
});

window.addEventListener('resize', () => {
    if (window.matchMedia && window.matchMedia("(max-width: 36em)").matches) {
        btn?.removeAttribute('data-visible');
        if (btn?.getAttribute('aria-expanded') === 'false') {
            closeNavList();
        }
    } else {
        btn?.setAttribute('data-visible', 'false');
        btn?.setAttribute('aria-expanded', 'false');
        headerNavList?.removeAttribute('data-visible');
        main?.removeAttribute('data-visible');
        footer?.removeAttribute('data-visible');
    }
});

btn?.addEventListener('click', () => {
    btn.getAttribute('aria-expanded') === 'true' ? closeNavList() : openNavList();
});

// ************************* Functions *******************************//

function openNavList() {
    btn?.setAttribute('aria-expanded', 'true');
    headerNavList?.removeAttribute('data-visible');
    main?.setAttribute('data-visible', 'false');
    footer?.setAttribute('data-visible', 'false');
}

function closeNavList() {
    btn?.setAttribute('aria-expanded', 'false');
    headerNavList?.setAttribute('data-visible', 'false');
    main?.removeAttribute('data-visible');
    footer?.removeAttribute('data-visible');
}