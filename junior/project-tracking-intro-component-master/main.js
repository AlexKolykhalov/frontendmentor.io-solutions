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
    if (window.matchMedia && window.matchMedia("(min-width: 36em)").matches) {
        headerNavBtn?.setAttribute('data-visible', 'false');
    } else {
        headerNavList?.setAttribute('data-visible', 'false');
    }
});

window.addEventListener('resize', () => {
    if (window.matchMedia && window.matchMedia("(min-width: 36em)").matches) {
        headerNavBtn?.setAttribute('data-visible', 'false');
        headerNavBtn?.setAttribute('aria-expanded', 'false');
        headerNavList?.removeAttribute('data-visible');
    } else {
        headerNavBtn?.removeAttribute('data-visible');
        if (headerNavBtn?.getAttribute('aria-expanded') === 'false') {
            headerNavList?.setAttribute('data-visible', 'false');
        }
    }
});

headerNavBtn?.addEventListener('click', () => {
    if (headerNavList?.getAttribute('data-visible') === 'false') {
        openNavList();
    } else {
        closeNavList();
    }
});

// ************************* 2. Functions *******************************//

function closeNavList() {
    headerNavBtn?.setAttribute('aria-expanded', 'false');
    headerNavList?.setAttribute('data-visible', 'false');
}

function openNavList() {
    headerNavBtn?.setAttribute('aria-expanded', 'true');
    headerNavList?.setAttribute('data-visible', 'true');
}