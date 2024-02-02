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
* @type {HTMLInputElement|null}
*/
const input = document.querySelector('input');

/**
* @type {HTMLButtonElement|null}
*/
const btn = document.querySelector('form button');

/**
* @type {NodeListOf<HTMLLIElement>}
*/
const listCarouselImgs = document.querySelectorAll('.carousel-images>li');

/**
* @type {HTMLDivElement|null}
*/
const carouselImgs = document.querySelector('.carousel-images');

/**
* @type {NodeListOf<HTMLLIElement>}
*/
const listCarouselThumbnailsBtns = document.querySelectorAll('.carousel-thumbnails>li>button');

/**
* @type {HTMLUListElement|null}
*/
const carouselThumbnails = document.querySelector('.carousel-thumbnails');

let startPoint = 0;
let delta = 0;
let currentImageIndex = 0;

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
        setFocusableMoreInfoInCarousel();
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

btn?.addEventListener('click', (e) => {
    if (input?.value.match(/^[\w\-\.]+@[\w\-\.]+\.[a-z]{2,3}$/) === null) {
        input.parentElement?.setAttribute('data-status', 'error');
        e.preventDefault();
        e.stopPropagation();
    }
});

input?.addEventListener('input', () => {
    input.parentElement?.removeAttribute('data-status');
});

listCarouselThumbnailsBtns.forEach(elem => {
    elem.addEventListener('click', () => {
        const index = [...listCarouselThumbnailsBtns].indexOf(elem);
        updateCarousel(index)
    });
});

carouselImgs?.addEventListener('touchstart', (e) => {
    // may work incorrectly when something overlap touch area
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
    if (currentImageIndex !== index) {
        updateCarousel(index);
    } else {
        //return position of carousel images
        listCarouselImgs.forEach(elem => {
            elem.setAttribute('style', `--i:${index}`);
        });
    }
}, { passive: true });

// ************************* 2. Functions *******************************//

function closeMobileNavBar() {
    headerNavList?.setAttribute('data-visible', 'false');
    headerNavBtn?.setAttribute('aria-expanded', 'false');

    const header = document.querySelector('header');
    const main = document.querySelector('main');
    const headerLogo = document.querySelector('.header-logo');
    const headerSocialLinks = document.querySelector('.header-social-links');
    const form = document.querySelector('form');
    const carousel = document.querySelector('.carousel');
    if (header && main && headerLogo && headerSocialLinks && form && carousel) {
        header.classList.remove('fixed');
        main.classList.remove('pad-top-xl');
        headerLogo.removeAttribute('data-theme');
        headerSocialLinks.setAttribute('data-visible', 'false');
        form.parentElement?.classList.remove('z-index');
        carousel.classList.remove('z-index');
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

    const header = document.querySelector('header');
    const main = document.querySelector('main');
    const headerLogo = document.querySelector('.header-logo');
    const headerSocialLinks = document.querySelector('.header-social-links');
    const form = document.querySelector('form');
    const carousel = document.querySelector('.carousel');
    if (header && main && headerLogo && headerSocialLinks && form && carousel) {
        header.classList.add('fixed');
        main.classList.add('pad-top-xl');
        headerLogo.setAttribute('data-theme', 'contrast');
        headerSocialLinks.removeAttribute('data-visible');
        form.parentElement?.classList.add('z-index');
        carousel.classList.add('z-index');
    }
    const list = document.querySelectorAll('a:not(.header-nav-list a, .header-social-links a), button:not(.header-nav-btn), input, details');
    list.forEach(elem => {
        elem.setAttribute('tabindex', '-1');
        elem.setAttribute('style', 'pointer-events: none');
    });
}

/**
 * @param {number} index
 */
function updateCarousel(index) {
    //update carousel image
    listCarouselImgs.forEach(elem => {
        elem.setAttribute('style', `--i:${index}`);
        const a = elem.querySelector('a');
        // set unfocusable to all 'More info' 'a' in carousel
        if (a) {
            a.setAttribute('tabindex', '-1');
        }
    });
    const current = listCarouselImgs[index];
    const currentA = current.querySelector('a');
    if (currentA) {
        // only the visible 'More info' 'a' in carousel must be focusable 
        currentA.removeAttribute('tabindex');
    }

    // listCarouselImgs[currentImageIndex].removeAttribute('data-status');
    // listCarouselImgs[index].setAttribute('data-status', 'current');

    //update thumbnail
    const listCarouselThumbnailsLIs = document.querySelectorAll('.carousel-thumbnails>li');
    const currentThumbnail = [...listCarouselThumbnailsLIs].find(t => t.getAttribute('data-status') === 'current');
    if (carouselThumbnails) {
        currentThumbnail?.removeAttribute('data-status');
        listCarouselThumbnailsLIs[index].setAttribute('data-status', 'current');
        carouselThumbnails.scrollLeft = 70 * index;
    }
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

/**
 * Set focusability only to the 'More info' `a` on the active tab.
 */
function setFocusableMoreInfoInCarousel() {
    [...listCarouselImgs].forEach((elem) => {
        const a = elem.querySelector('a');
        if (a) {
            const index = [...listCarouselImgs].indexOf(elem);
            // if index didn't match current index then set unfocusable
            if (index !== currentImageIndex) {
                a.setAttribute('tabindex', '-1');
            }
        }
    });
}
