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
const listTechNavBtns = document.querySelectorAll('.tech-nav button');

/**
* @type {number}
*/
let intervalId = 0;

// ************************** 1. Events *********************************//

carousel?.addEventListener('turned', (e) => {
    // current index in carousel
    const index = e.detail;
    updateTechInfo(index);
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

listTechNavBtns.forEach(bnt => {
    bnt.addEventListener('click', async () => {
        const arr = [...listTechNavBtns];
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
function updateTechInfo(index) {
    const tech = getDataByIndex(index);

    /**
    * @type {HTMLPictureElement|null}
    */
    const pic = document.querySelector('.tech-image');

    /**
    * @type {HTMLParagraphElement|null}
    */
    const name = document.querySelector('.name');

    /**
    * @type {HTMLParagraphElement|null}
    */
    const description = document.querySelector('.tech-text');

    if (name) {
        name.textContent = tech.name;
    }
    if (description) {
        description.textContent = tech.description;
    }
    if (pic) {
        /**
        * @type {HTMLSourceElement|null}
        */
        const source = pic.querySelector('source');

        /**
        * @type {HTMLImageElement|null}
        */
        const img = pic.querySelector('img');

        if (source && img) {
            source.srcset = tech.images.portrait;
            img.src = tech.images.landscape;
            img.alt = tech.name;
        }
    }
}

/**
 * @param {number} index 
 */
function setNavBtnActiveStatus(index) {
    // clear all active status
    listTechNavBtns.forEach(btn => {
        btn.removeAttribute('data-status');
    });
    listTechNavBtns[index].setAttribute('data-status', 'active');
}