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
const listPlanetNavBtns = document.querySelectorAll('.planet-nav button');

/**
* @type {number}
*/
let intervalId = 0;

// ************************** 1. Events *********************************//

carousel?.addEventListener('turned', (e) => {
    // current index in carousel
    const index = e.detail;
    updatePlanetInfo(index);
    setNavBtnActiveStatus(index);
});

carouselController?.addEventListener('play', (e) => {
    let index = e.detail;
    const duration = window.matchMedia("(min-width: 48em)").matches ? 100 : 500;
    intervalId = setInterval(() => {
        index++;
        animateCarouselImages(index, duration);
    }, 4000);
});

carouselController?.addEventListener('pause', () => {
    clearInterval(intervalId);
});

listPlanetNavBtns.forEach(bnt => {
    bnt.addEventListener('click', () => {
        const arr = [...listPlanetNavBtns];
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
function updatePlanetInfo(index) {
    const planet = getDataByIndex(index);

    /**
    * @type {HTMLImageElement|null}
    */
    const img = document.querySelector('.planet-image');

    /**
    * @type {HTMLParagraphElement|null}
    */
    const name = document.querySelector('.destination');

    /**
    * @type {HTMLParagraphElement|null}
    */
    const description = document.querySelector('.destination-description');

    /**
    * @type {HTMLParagraphElement|null}
    */
    const distance = document.querySelector('.distance');

    /**
    * @type {HTMLParagraphElement|null}
    */
    const travel = document.querySelector('.travel-time');

    if (name) {
        name.textContent = planet.name;
    }
    if (description) {
        description.textContent = planet.description;
    }
    if (distance) {
        distance.textContent = planet.distance;
    }
    if (travel) {
        travel.textContent = planet.travel;
    }
    if (img) {
        img.src = planet.images.webp;
        img.alt = planet.name;
    }
}

/**
 * @param {number} index 
 */
function setNavBtnActiveStatus(index) {
    // clear all active status
    listPlanetNavBtns.forEach(btn => {
        btn.removeAttribute('data-status');
    });
    listPlanetNavBtns[index].setAttribute('data-status', 'active');
}