// @ts-check

/**
* @type {HTMLInputElement | null}
*/
const range = document.querySelector('#slider_bar');

/**
* @type {HTMLInputElement | null}
*/
const toggle = document.querySelector('.toggle>input[type="checkbox"]');

/**
* @type {HTMLInputElement | null}
*/
const discount = document.querySelector('.discount');

/**
* @type {NodeListOf<HTMLDivElement> | null}
*/
const price = document.querySelectorAll('.price');

// **********************************************************************//
// ************************** 1. Events *********************************//
// **********************************************************************//

window.addEventListener('load', () => {
    if (window.matchMedia("(min-width: 36em)").matches) {
        if (discount) {
            discount.textContent = '25% discount';
        }
        price[0].removeAttribute('data-visible');
        price[1].setAttribute('data-visible', 'false');
    }
});

window.addEventListener('resize', () => {
    if (discount) {
        discount.textContent = '-25%';
        price[0].setAttribute('data-visible', 'false');
        price[1].removeAttribute('data-visible');
        if (window.matchMedia("(min-width: 36em)").matches) {
            discount.textContent = '25% discount';
            price[0].removeAttribute('data-visible');
            price[1].setAttribute('data-visible', 'false');
        }
    }
});

range?.addEventListener('input', (e) => {
    if (e.target) {
        // @ts-ignore
        changeDataValues(e.target.value);
        // @ts-ignore
        range.style.setProperty('--p', e.target.value + "%");
    }
});

toggle?.addEventListener('click', () => {
    if (range) {
        changeDataValues(range.value);
    }
});

// ************************* 2. Functions *******************************//
// **********************************************************************//

/**
 * @param {string} monthPageviews
 * @param {string} yearPageviews
 * @param {string} monthPrice
 * @param {string} yearPrice
 */
function setValues(monthPageviews, yearPageviews, monthPrice, yearPrice) {

    /**
    * @type {HTMLDivElement | null}
    */
    const pageviews = document.querySelector('.pageviews');

    /**
    * @type {NodeListOf<HTMLDivElement> | null}
    */
    const price = document.querySelectorAll('.price');

    if (pageviews) {
        pageviews.textContent = toggle?.checked ? yearPageviews : monthPageviews;
    }

    price.forEach(e => {
        const value = e.querySelector('span:nth-of-type(1)');
        const period = e.querySelector('span:nth-of-type(2)');
        if (value && period) {
            value.textContent = toggle?.checked ? yearPrice : monthPrice;
            period.textContent = toggle?.checked ? '/ year' : '/ month';
        }
    });
}

/**
 * @param {string} value 
 */
function changeDataValues(value) {
    let monthPageviews = '';
    let yearPageviews = '';
    let monthPrice = '';
    let yearPrice = '';
    switch (value) {
        case "0":
            monthPageviews = '50k';
            yearPageviews = '600k';
            monthPrice = '$12.00';
            yearPrice = '$108.00';
            break;
        case "25":
            monthPageviews = '75k';
            yearPageviews = '900k';
            monthPrice = '$14.00';
            yearPrice = '$126.00';
            break;
        case "50":
            monthPageviews = '100k';
            yearPageviews = '1.2m';
            monthPrice = '$16.00';
            yearPrice = '$144.00';
            break;
        case "75":
            monthPageviews = '150k';
            yearPageviews = '1.8m';
            monthPrice = '$20.00';
            yearPrice = '$180.00';
            break;
        case "100":
            monthPageviews = '200k';
            yearPageviews = '2.4m';
            monthPrice = '$32.00';
            yearPrice = '$288.00';
            break;
        default:
            break;
    }
    setValues(monthPageviews, yearPageviews, monthPrice, yearPrice);
}