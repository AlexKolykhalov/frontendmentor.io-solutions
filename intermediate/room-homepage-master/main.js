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
const carouselPreviousBtn = document.querySelector('.carousel-controllers>button:first-child');

/**
* @type {HTMLButtonElement|null}
*/
const carouselNextBtn = document.querySelector('.carousel-controllers>button:last-child');

/**
* @type {NodeListOf<HTMLLIElement>}
*/
const listCarouselImgs = document.querySelectorAll('.carousel-images>li');

/**
* @type {HTMLDivElement|null}
*/
const carouselImgs = document.querySelector('.carousel-images');

const resizeObserver = new ResizeObserver((entries) => {
    const controllers = document.querySelector('.carousel-controllers');
    if (controllers && entries[0] && entries[0].contentBoxSize[0]) {
        const box = controllers.getBoundingClientRect();
        if (window.matchMedia("(min-width: 62em)").matches) {
            controllers.setAttribute('style', `--top: ${entries[0].contentBoxSize[0].blockSize - box.height}px; --left: ${entries[0].contentBoxSize[0].inlineSize}px`);
        } else {
            controllers.setAttribute('style', `--top: ${entries[0].contentBoxSize[0].blockSize - box.height}px; --left: ${entries[0].contentBoxSize[0].inlineSize - box.width}px`);
        }
    }
});

let startPoint = 0;
let delta = 0;
let currentImageIndex = 0;

// ************************** 1. Events *********************************//

window.addEventListener('load', () => {
    headerNavBtn?.removeAttribute('data-visible');
    if (window.matchMedia("(min-width: 48em)").matches) {
        headerNavBtn?.setAttribute('data-visible', 'false');
    }
    if (carouselImgs) {
        const pic = carouselImgs.querySelector('picture');
        if (pic) {
            // observe image hero size to calculate position of 
            // controll buttons
            resizeObserver.observe(pic);
        }
    }
});

window.addEventListener('resize', () => {
    if (window.matchMedia("(min-width: 48em)").matches) {
        headerNavBtn?.setAttribute('data-visible', 'false');
        headerNavBtn?.setAttribute('aria-expanded', 'false');
        const listFocus = document.querySelectorAll('.header-nav-list a');
        listFocus.forEach((elem) => {
            elem.removeAttribute('tabindex');
        });
    } else {
        headerNavBtn?.removeAttribute('data-visible');
        closeMobileNavBar();
    }
});

carouselPreviousBtn?.addEventListener('click', () => {
    const index = checkIndex(currentImageIndex - 1);
    updateCarousel(index);
});

carouselNextBtn?.addEventListener('click', () => {
    const index = checkIndex(currentImageIndex + 1);
    updateCarousel(index);
});

carouselImgs?.addEventListener('touchstart', (e) => {
    startPoint = e.touches[0].clientX;
}, { passive: true });

carouselImgs?.addEventListener('touchmove', (e) => {
    const x = e.touches[0].clientX;
    delta = startPoint - x;
    if (Math.abs(delta) < 100) {
        listCarouselImgs.forEach(e => {
            e.setAttribute('style', `--i:${currentImageIndex + delta / 1000}`);
        });
    }
}, { passive: true });

carouselImgs?.addEventListener('touchend', () => {
    let i = currentImageIndex;
    if (delta > 90) {
        i = currentImageIndex + 1;
    }
    if (delta < -90) {
        i = currentImageIndex - 1;
    }
    delta = 0;
    const index = checkIndexTouchMode(i);
    updateCarousel(index);
}, { passive: true });

headerNavBtn?.addEventListener('click', () => {
    if (headerNavBtn?.getAttribute('aria-expanded') === 'false') {
        openMobileNavBar();
    } else {
        closeMobileNavBar();
    }
});

// ************************* 2. Functions *******************************//

/**
 * @param {number} index
 */
function updateCarousel(index) {
    //update carousel image
    listCarouselImgs.forEach(elem => {
        elem.setAttribute('style', `--i:${index}`);
    });
    listCarouselImgs[currentImageIndex].removeAttribute('data-status');
    listCarouselImgs[index].setAttribute('data-status', 'current');

    currentImageIndex = index;
}

/**
 * if (index < 0) => listCarouselImgs.length - 1,
 * if (index > listCarouselImgs.length - 1) => 0
 * @param {number} index
 */
function checkIndex(index) {
    if (index < 0) {
        return listCarouselImgs.length - 1;
    }
    if (index > listCarouselImgs.length - 1) {
        return 0;
    }
    return index;
}

/**
 * if (index < 0) => 0,
 * if (index > listCarouselImgs.length - 1) => listCarouselImgs.length - 1
 * @param {number} index
 */
function checkIndexTouchMode(index) {
    if (index < 0) {
        return 0;
    }
    if (index > listCarouselImgs.length - 1) {
        return listCarouselImgs.length - 1;
    }
    return index;
}

function closeMobileNavBar() {
    headerNavBtn?.setAttribute('aria-expanded', 'false');

    const listFocus = document.querySelectorAll('[tabindex="-1"]:not(.header-nav-list a)');
    listFocus.forEach((elem) => {
        elem.removeAttribute('tabindex');
        elem.removeAttribute('style');
    });

    const listUnfocus = document.querySelectorAll('.header-nav-list a');
    listUnfocus.forEach((elem) => {
        elem.setAttribute('tabindex', '-1');
    });
}

function openMobileNavBar() {
    headerNavBtn?.setAttribute('aria-expanded', 'true');

    const listFocus = document.querySelectorAll('.header-nav-list a');
    listFocus.forEach((elem) => {
        elem.removeAttribute('tabindex');
        elem.removeAttribute('style');
    });

    const listUnfocus = document.querySelectorAll('a:not(.header-nav-list a), button:not(nav button)');
    listUnfocus.forEach((elem) => {
        elem.setAttribute('tabindex', '-1');
        elem.setAttribute('style', 'pointer-events: none');
    });
}