// @ts-check

/**
* @type {HTMLDivElement | null}
*/
const slider = document.querySelector('.slider');

/**
* @type {HTMLImageElement | null}
*/
const sliderPhoto = document.querySelector('.slider-photo');

/**
* @type {HTMLParagraphElement | null}
*/
const testimonialBlock = document.querySelector('.testimonial-block');

/**
* @type {HTMLParagraphElement | null}
*/
const testimonialText = document.querySelector('.testimonial-text');

/**
* @type {HTMLDivElement | null}
*/
const testimonialAuthor = document.querySelector('.testimonial-author');

/**
* @type {HTMLButtonElement | null}
*/
const rightButton = document.querySelector('.button-right');

/**
* @type {HTMLButtonElement | null}
*/
const leftButton = document.querySelector('.button-left');

/**
* @type {Array}
*/
let data = [];

/**
* @type {Number}
*/
let count = 0;

// ************************** Events *********************************//

window.addEventListener('load', async () => {
    try {
        const response = await fetch('data.json');
        data = await response.json();
        fetchData();
    } catch (error) { }
});

leftButton?.addEventListener('click', () => {
    count--;
    console.log(count);
    animateElements();
    fetchData();
});

rightButton?.addEventListener('click', () => {
    count++;
    console.log(count);
    animateElements();
    fetchData();
});

// ************************* Functions *******************************//

function animateElements() {
    if (testimonialBlock) {
        testimonialBlock.removeAttribute('data-animated');
        void testimonialBlock.offsetWidth;
        testimonialBlock.setAttribute('data-animated', 'true');
    }
    if (sliderPhoto) {
        sliderPhoto.removeAttribute('data-animated');
        void sliderPhoto.offsetWidth;
        sliderPhoto.setAttribute('data-animated', 'true');
    }
}

function fetchData() {
    count = count > 1 ? 0 : count;
    count = count < 0 ? 1 : count;
    console.log(count);
    if (sliderPhoto) {
        sliderPhoto.src = data[count].photo;
        sliderPhoto.alt = `${data[count].author}'s photo`;
    }

    if (testimonialText) {
        testimonialText.textContent = data[count].testimonial;
    }

    if (testimonialAuthor) {
        const author = testimonialAuthor.querySelector('p:first-child');
        const occupation = testimonialAuthor.querySelector('p:last-child');
        if (author) {
            author.textContent = data[count].author;
        }
        if (occupation) {
            occupation.textContent = data[count].occupation;
        }
    }
}