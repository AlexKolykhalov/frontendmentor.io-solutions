// @ts-check

import { getDataByIndex, animateCarouselImages } from "./carousel.js"

/**
* @type {HTMLDivElement|null}
*/
const carousel = document.querySelector('.carousel');

/**
* @type {HTMLButtonElement|null}
*/
const carouselController = document.querySelector('.carousel-controller');

/**
* @type {NodeListOf<HTMLButtonElement>}
*/
const listCrewNavBtns = document.querySelectorAll('.crew-nav button');

/**
* @type {number}
*/
let intervalId = 0;

// ************************** 1. Events *********************************//

carousel?.addEventListener('turned', (e) => {
    // current index in carousel
    const index = e.detail;
    updateCrewInfo(index);
    setNavBtnActiveStatus(index);
});

carouselController?.addEventListener('play', (e) => {
    let index = e.detail;
    intervalId = setInterval(() => {
        index++;
        const duration = window.matchMedia("(min-width: 48em)").matches ? 100 : 500;
        animateCarouselImages(index, duration);
    }, 4000);
});

carouselController?.addEventListener('pause', () => {
    clearInterval(intervalId);
});

listCrewNavBtns.forEach(bnt => {
    bnt.addEventListener('click', async () => {
        const arr = [...listCrewNavBtns];
        const index = arr.indexOf(bnt);
        const duration = window.matchMedia("(min-width: 48em)").matches ? 100 : 300;
        animateCarouselImages(index, duration);
        carouselController?.dispatchEvent(new CustomEvent('break'));
    });
});

// ************************* 2. Functions *******************************//

/**
 * @param {number} index 
 */
function updateCrewInfo(index) {
    const crew = getDataByIndex(index);

    /**
    * @type {HTMLImageElement|null}
    */
    const img = document.querySelector('.crew-image');

    /**
    * @type {HTMLParagraphElement|null}
    */
    const name = document.querySelector('.name');

    /**
    * @type {HTMLParagraphElement|null}
    */
    const role = document.querySelector('.role');

    /**
    * @type {HTMLParagraphElement|null}
    */
    const bio = document.querySelector('.bio');

    if (name) {
        name.textContent = crew.name;
    }
    if (role) {
        role.textContent = crew.role;
    }
    if (bio) {
        bio.textContent = crew.bio;
    }
    if (img) {
        img.src = crew.images.webp;
        img.alt = crew.role;
    }
}

/**
 * @param {number} index 
 */
function setNavBtnActiveStatus(index) {
    // clear all active status
    listCrewNavBtns.forEach(btn => {
        btn.removeAttribute('data-status');
    });
    listCrewNavBtns[index].setAttribute('data-status', 'active');
}