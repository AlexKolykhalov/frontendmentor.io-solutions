// @ts-check


/**
* @type {HTMLButtonElement|null}
*/
const headerNavListBtn = document.querySelector('.header-nav-btn');

/**
* @type {HTMLUListElement|null}
*/
const headerNavList = document.querySelector('.header-nav-list');

/**
* @type {NodeListOf<HTMLDetailsElement>|null}
*/
const headerNavListElements = document.querySelectorAll('.header-nav-list-element');

/**
* @type {boolean}
*/
let hasClickChecking = false;


// **********************************************************************//
// ***********************  Table of content  ***************************//
// **********************************************************************//
// 
// 1. Events
//  1.1 headerNavListBtn
//  
// 2. Functions




// **********************************************************************//
// ************************** 1. Events *********************************//
// **********************************************************************//
window.addEventListener('load', () => {
    if (window.matchMedia("(min-width: 48rem)").matches) {
        headerNavListBtn?.setAttribute('data-visible', 'false');
        if (hasClickChecking === false) {
            document.addEventListener('click', clickChecking);
            hasClickChecking = true;
        }
    } else {
        closeNavList();        
    }
});

window.addEventListener('resize', () => {
    if (window.matchMedia("(min-width: 48rem)").matches) {
        headerNavListBtn?.setAttribute('data-visible', 'false');
        headerNavList?.removeAttribute('data-visible');
        if (hasClickChecking === false) {
            document.addEventListener('click', clickChecking);
            hasClickChecking = true;
        }
    } else {
        if (hasClickChecking === true) {
            document.removeEventListener('click', clickChecking);
            hasClickChecking = false;
            closeNavList();
        }
        headerNavListBtn?.removeAttribute('data-visible');
        // closeNavList();
    }
});

// ********************* 1.1 headerNavListBtn ***************************//
// **********************************************************************//
headerNavListBtn?.addEventListener('click', () => {
    if (headerNavList?.hasAttribute('data-visible')) {
        openNavList();
    } else {
        closeNavList();
    }
});

headerNavListElements.forEach(element => {
    element.addEventListener('click', () => {
        if (element.open === false) {
            /**
             * @type {HTMLUListElement|null}
             */
            const ul = element.querySelector('ul');
            if (ul) {
                ul.style.animationName = 'none';
                requestAnimationFrame(() => {
                    ul.style.animationName = '';
                });
            }
        }
    });
});


// **********************************************************************//
// **********************************************************************//
// **********************************************************************//




// **********************************************************************//
// **********************************************************************//
// **********************************************************************//


// ************************* 2. Functions *******************************//
// **********************************************************************//
function openNavList() {
    headerNavList?.removeAttribute('data-visible');
    headerNavListBtn?.setAttribute('aria-expanded', 'true');
    headerNavListBtn?.setAttribute('data-status', 'open');
}

function closeNavList() {
    headerNavList?.setAttribute('data-visible', 'false');
    headerNavListBtn?.setAttribute('aria-expanded', 'false');
    headerNavListBtn?.setAttribute('data-status', 'close');

    headerNavListElements?.forEach(element => {
        element.open = false;
    });
}

/**
 * @param {Event} event
 */
const clickChecking = function (event) {
    headerNavListElements?.forEach(element => {
        const summary = element.querySelector('summary');
        const ul = element.querySelector('ul');

        // @ts-ignore for event.target
        const check = [...element.querySelectorAll('li')].includes(event.target);

        const condition = event.target !== summary && event.target !== ul && check === false;
        if (element.open && condition) {
            element.open = false;
        }
    });
}

// **********************************************************************//
// **********************************************************************//
// **********************************************************************//
