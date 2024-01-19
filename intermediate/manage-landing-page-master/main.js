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
* Initial elements of carousel.
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
const listCarouselThumbnails = document.querySelectorAll('.carousel-thumbnails>li');

/**
* @type {HTMLButtonElement|null}
*/
const submitBtn = document.querySelector('input+button');

/**
* @type {HTMLInputElement|null}
*/
const inputField = document.querySelector('input');

let intervalID = 0;
let startPoint = 0;
let delta = 0;
let currentImageIndex = 0;
let pauseInterval = false;

// ************************** 1. Events *********************************//

document.addEventListener('visibilitychange', () => {
    pauseInterval = document.hidden ? true : false;
});

window.addEventListener('load', () => {
    headerNavBtn?.removeAttribute('data-visible');
    if (window.matchMedia("(min-width: 48em)").matches) {
        headerNavBtn?.setAttribute('data-visible', 'false');
        headerNavList?.removeAttribute('data-visible');
        animateCarousel();
    }
});

window.addEventListener('resize', () => {
    if (window.matchMedia("(min-width: 48em)").matches) {
        headerNavBtn?.setAttribute('data-visible', 'false');
        headerNavBtn?.setAttribute('aria-expanded', 'false');
        headerNavList?.removeAttribute('data-visible');
        animateCarousel();
    } else {
        headerNavBtn?.removeAttribute('data-visible');
        closeMobileNavBar();
        if (intervalID > 0) {
            stopAnimatingCarousel();
        }
    }
});

inputField?.addEventListener('input', () => {
    inputField.parentElement?.removeAttribute('data-status');
});

submitBtn?.addEventListener('click', () => {
    if (inputField) {
        const result = checkInput();
        if (result === false) {
            inputField.parentElement?.setAttribute('data-status', 'error');
        }
    }
});

headerNavBtn?.addEventListener('click', () => {
    if (headerNavList?.getAttribute('data-visible') === 'false') {
        openMobileNavBar();
    } else {
        closeMobileNavBar();
    }
});

listCarouselThumbnails.forEach(elem => {
    elem.addEventListener('click', () => {
        const index = [...listCarouselThumbnails].indexOf(elem);
        updateCarousel(index)
    });
});

carouselImgs?.addEventListener('touchstart', (e) => {
    // may work incorrectly when something overlap touch area
    startPoint = e.touches[0].clientX;
}, { passive: true });

carouselImgs?.addEventListener('touchmove', (e) => {
    if (window.matchMedia("(min-width: 48em)").matches === false) {
        const x = e.touches[0].clientX;
        delta = startPoint - x;
        if (Math.abs(delta) < 100) {
            listCarouselImgs.forEach(e => {
                e.setAttribute('style', `--i:${currentImageIndex + delta / 1000}`);
            });
        }
    }
}, { passive: true });

carouselImgs?.addEventListener('touchend', () => {
    if (window.matchMedia("(min-width: 48em)").matches === false) {
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
    }
}, { passive: true });

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
    const list = document.querySelectorAll('a:not(.header-nav-list a), button:not(nav button), input');
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
    });
    listCarouselImgs[currentImageIndex].removeAttribute('data-status');
    listCarouselImgs[index].setAttribute('data-status', 'current');

    //update thumbnail
    const currentThumbnail = [...listCarouselThumbnails].find(t => t.getAttribute('data-status') === 'current');
    currentThumbnail?.removeAttribute('data-status');
    listCarouselThumbnails[index].setAttribute('data-status', 'current');
    currentImageIndex = index;
}

function animateCarousel() {
    if (intervalID === 0) {
        // remove all attributes to prevent shift in desktop mode
        removeAttributes();
        intervalID = setInterval(() => {
            if (pauseInterval) {
                return;
            }
            /**
            * @type {NodeListOf<HTMLLIElement>}
            */
            const currentListCarouselImgs = document.querySelectorAll('.carousel-images>li');
            let states = [];
            currentListCarouselImgs.forEach((elem) => {
                // animate each element of the carousel
                const state = elem.animate(
                    [{ translate: "-135% 0" }],
                    {
                        easing: "ease-in",
                        duration: 1000,
                    }
                ).finished;
                states.push(state);
            });
            // waiting when all animation is finished
            Promise.all(states).then(
                () => {
                    try {
                        // remove first element from the DOM
                        carouselImgs?.removeChild(currentListCarouselImgs[0]);

                        // clone the first element and append to the end
                        const template = currentListCarouselImgs[0].cloneNode(true);
                        carouselImgs?.appendChild(template);
                    } catch (error) {
                        console.log(error);
                    }
                }
            );
        }, 4500);
    }
}

function stopAnimatingCarousel() {
    clearInterval(intervalID);
    intervalID = 0;
    currentImageIndex = 0;
    // remove all attributes to prevent shift in mobile mode
    removeAttributes();
    // return the original order of elements
    carouselImgs?.replaceChildren(...listCarouselImgs);
    const currentThumbnail = document.querySelector('.carousel-thumbnails>li[data-status="current"]')
    if (currentThumbnail) {
        currentThumbnail.removeAttribute('data-status');
        listCarouselThumbnails[0].setAttribute('data-status', 'current');
    }
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

function removeAttributes() {
    listCarouselImgs.forEach((elem) => {
        elem.removeAttribute('style');
        elem.removeAttribute('data-status');
    });
}

function checkInput() {
    if (inputField) {
        if (inputField.value.trim() === '') {
            return false;
        }
        if (inputField.value.match(/^[\w\-\.]+@[\w\-\.]+\.[a-z]{2,3}$/) === null) {
            return false;
        }
    }
    return true;
}