// @ts-check

/**
* @type {HTMLElement | null}
*/
const main = document.querySelector('main');

/**
* @type {HTMLElement | null}
*/
const footer = document.querySelector('footer');

/**
* @type {HTMLDivElement | null}
*/
const hero = document.querySelector('.hero');

/**
* @type {HTMLImageElement | null}
*/
const headerBackgroundImage = document.querySelector('.header-background-image');

/**
* @type {HTMLButtonElement | null}
*/
const headerNavBtn = document.querySelector('.header-nav-btn');

/**
* @type {HTMLUListElement | null}
*/
const headerNavList = document.querySelector('#header_nav_list');

/**
* @type {NodeListOf<HTMLButtonElement>}
*/
const listOfButtons = document.querySelectorAll('.button');

// **********************************************************************//
// ************************** 1. Events *********************************//
// **********************************************************************//

window.addEventListener('load', () => {
    if (window.matchMedia("(min-width: 36em)").matches) {
        headerNavBtn?.setAttribute('data-visible', 'false');
        headerNavList?.removeAttribute('data-visible');
        listOfButtons[0].removeAttribute('data-visible');
        listOfButtons[1].setAttribute('data-visible', 'false');
    }
});

window.addEventListener('resize', ()=>{
    if (window.matchMedia("(min-width: 36em)").matches) {
        headerNavBtn?.setAttribute('data-visible', 'false');
        headerNavBtn?.setAttribute('aria-expanded', 'false');
        headerNavList?.removeAttribute('data-visible');
        main?.removeAttribute('data-visible');
        footer?.removeAttribute('data-visible');
        hero?.removeAttribute('data-visible');
        headerBackgroundImage?.removeAttribute('data-visible');
        listOfButtons[0].removeAttribute('data-visible');
        listOfButtons[1].setAttribute('data-visible', 'false');
    } else {
        headerNavBtn?.removeAttribute('data-visible');
        if (headerNavBtn?.getAttribute('aria-expanded')==='false') {
            headerNavList?.setAttribute('data-visible', 'false');
        }
        listOfButtons[0].setAttribute('data-visible', 'false');
        listOfButtons[1].removeAttribute('data-visible');
    }
});

// ********************** 1.1 headerNavBtn ******************************//
// **********************************************************************//

headerNavBtn?.addEventListener('click', () => {
    if (headerNavBtn.getAttribute('aria-expanded') === 'false') {
        headerNavBtn.setAttribute('aria-expanded', 'true');
        main?.setAttribute('data-visible', 'false');
        footer?.setAttribute('data-visible', 'false');
        hero?.setAttribute('data-visible', 'false');
        headerBackgroundImage?.setAttribute('data-visible', 'false');
        headerNavList?.removeAttribute('data-visible');
    } else {
        headerNavBtn.setAttribute('aria-expanded', 'false');
        main?.removeAttribute('data-visible');
        footer?.removeAttribute('data-visible');
        hero?.removeAttribute('data-visible');
        headerBackgroundImage?.removeAttribute('data-visible');
        headerNavList?.setAttribute('data-visible', 'false');
    }
});

// ************************* 2. Functions *******************************//
// **********************************************************************//


// **********************************************************************//
// **********************************************************************//
// **********************************************************************//
