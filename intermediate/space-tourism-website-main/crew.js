// @ts-check

import { getDataByIndex, setCurrentCarouselIndex, updateCarouselImages } from "./carousel.js"

/**
* @type {HTMLDivElement|null}
*/
const carousel = document.querySelector('.carousel');

/**
* @type {NodeListOf<HTMLButtonElement>}
*/
const listCrewNavBtns = document.querySelectorAll('.crew-nav button');

// ************************** 1. Events *********************************//

carousel?.addEventListener('turned', (e) => {
    // console.log('turned');
    // current index in carousel
    const index = e.detail;
    updateCrewInfo(index);
    setCurrentCarouselIndex(index);
    updateCarouselImages();
    // clear all active status
    listCrewNavBtns.forEach(btn => {
        btn.removeAttribute('data-status');
    });
    listCrewNavBtns[index].setAttribute('data-status', 'active');
});

listCrewNavBtns.forEach(bnt => {
    bnt.addEventListener('click', async () => {
        // clear all active status
        listCrewNavBtns.forEach(btn => {
            btn.removeAttribute('data-status');
        });
        bnt.setAttribute('data-status', 'active');
        const arr = [...listCrewNavBtns];
        const index = arr.indexOf(bnt);
        updateCrewInfo(index);
        setCurrentCarouselIndex(index);
        updateCarouselImages();
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