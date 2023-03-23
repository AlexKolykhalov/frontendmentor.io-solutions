// @ts-check


/**
* @type {HTMLButtonElement|null}
*/
const btn = document.querySelector('.header-nav-btn');

/**
* @type {HTMLButtonElement|null}
*/
const headerNavList = document.querySelector('.header-nav-list');

/**
* @type {NodeListOf<HTMLLinkElement>|null}
*/
const headerNavLinkList = document.querySelectorAll('.header-nav-list a');

/**
* @type {HTMLImageElement|null}
*/
const iconArrowDown = document.querySelector('.icon-arrow-down');


// **********************************************************************//
// ***********************  Table of content  ***************************//
// **********************************************************************//
//
// 1. Events
//  1.1 btn
//
// 2. Functions


// **********************************************************************//
// ************************** 1. Events *********************************//
// **********************************************************************//

window.addEventListener('load', () => {
    if (window.matchMedia("(min-width: 48rem)").matches) {
        btn?.setAttribute('data-visible', 'false');        
    } else {        
        headerNavList?.setAttribute('data-visible', 'false');
        removeNavMenuFromOrder();
    }
});

window.addEventListener('resize', () => {
    if (window.matchMedia("(min-width: 48rem)").matches) {
        btn?.setAttribute('data-visible', 'false');
        headerNavList?.removeAttribute('data-visible');
        addNavMenuToOrder();
    } else {
        btn?.removeAttribute('data-visible');        
        closeNavMenu();
        removeNavMenuFromOrder();
    }
});

// *************************** 1.1 btn *********************************//
// **********************************************************************//
btn?.addEventListener('click', () => {
    if (headerNavList?.hasAttribute('data-visible')) {
        openNavMenu();
        addNavMenuToOrder();
    } else {
        closeNavMenu();
        removeNavMenuFromOrder();
    }
});

// **********************************************************************//
// **********************************************************************//
// **********************************************************************//




// **********************************************************************//
// **********************************************************************//
// **********************************************************************//


// ************************* 2. Functions *******************************//
// **********************************************************************//

function openNavMenu() {
    headerNavList?.removeAttribute('data-visible');
    btn?.setAttribute('aria-expanded', 'true');
    iconArrowDown?.setAttribute('data-visible', 'false');
}

function closeNavMenu() {
    headerNavList?.setAttribute('data-visible', 'false');
    btn?.setAttribute('aria-expanded', 'false');
    iconArrowDown?.removeAttribute('data-visible');
}

function addNavMenuToOrder() {
    headerNavLinkList?.forEach(element => {
        element.removeAttribute('tabindex');
    });
}

function removeNavMenuFromOrder() {
    headerNavLinkList?.forEach(element => {
        element.setAttribute('tabindex', '-1');
    });
}

// **********************************************************************//
// **********************************************************************//
// **********************************************************************//
