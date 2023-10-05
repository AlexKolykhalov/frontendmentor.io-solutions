// @ts-check

import { getDataByIndex, setCurrentCarouselIndex, updateCarouselImages } from "./carousel.js"

/**
* @type {HTMLDivElement|null}
*/
const carousel = document.querySelector('.carousel');

/**
* @type {NodeListOf<HTMLButtonElement>}
*/
const listPlanetNavBtns = document.querySelectorAll('.planet-nav button');

// ************************** 1. Events *********************************//

carousel?.addEventListener('turned', (e) => {
    // console.log('turned');
    // current index in carousel
    const index = e.detail;
    updatePlanetInfo(index);
    setCurrentCarouselIndex(index);
    updateCarouselImages();
    // clear all active status
    listPlanetNavBtns.forEach(btn => {
        btn.removeAttribute('data-status');
    });
    listPlanetNavBtns[index].setAttribute('data-status', 'active');
});

listPlanetNavBtns.forEach(bnt => {
    bnt.addEventListener('click', () => {
        // clear all active status
        listPlanetNavBtns.forEach(btn => {
            btn.removeAttribute('data-status');
        });
        bnt.setAttribute('data-status', 'active');
        const arr = [...listPlanetNavBtns];
        const index = arr.indexOf(bnt);
        updatePlanetInfo(index);
        setCurrentCarouselIndex(index);
        updateCarouselImages();
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