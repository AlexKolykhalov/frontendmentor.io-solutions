// @ts-check

import { getDataByIndex, setCurrentCarouselIndex, updateCarouselImages } from "./carousel.js"

/**
* @type {HTMLDivElement|null}
*/
const carousel = document.querySelector('.carousel');

/**
* @type {NodeListOf<HTMLButtonElement>}
*/
const listTechNavBtns = document.querySelectorAll('.tech-nav button');

// ************************** 1. Events *********************************//

carousel?.addEventListener('turned', (e) => {
    // console.log('turned');
    // current index in carousel
    const index = e.detail;
    updateTechInfo(index);
    setCurrentCarouselIndex(index);
    updateCarouselImages();
    // clear all active status
    listTechNavBtns.forEach(btn => {
        btn.removeAttribute('data-status');
    });
    listTechNavBtns[index].setAttribute('data-status', 'active');
});

listTechNavBtns.forEach(bnt => {
    bnt.addEventListener('click', async () => {
        // clear all active status
        listTechNavBtns.forEach(btn => {
            btn.removeAttribute('data-status');
        });
        bnt.setAttribute('data-status', 'active');
        const arr = [...listTechNavBtns];
        const index = arr.indexOf(bnt);
        updateTechInfo(index);
        setCurrentCarouselIndex(index);
        updateCarouselImages();
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