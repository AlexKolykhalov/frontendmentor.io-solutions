// @ts-check

/**
 * @type {HTMLElement|null}
 */
const sectionFormFill = document.querySelector('.form-fill');

/**
* @type {HTMLElement|null}
*/
const sectionComplited = document.querySelector('.complited');

/**
 * @type {HTMLFormElement|null}
 */
const form = document.querySelector('form');

/**
 * @type {HTMLDivElement|null}
 */
const divCardHolder = document.querySelector('.div-card-holder');

/**
 * @type {HTMLDivElement|null}
 */
const divCardNumber = document.querySelector('.div-card-number');

/**
 * @type {HTMLDivElement|null}
 */
const divCVC = document.querySelector('.div-cvc');

/**
 * @type {HTMLDivElement|null}
 */
const divExpDate = document.querySelector('.div-exp-date');

/**
 * @type {HTMLDivElement|null}
 */
const front = document.querySelector('.front');

/**
 * @type {HTMLDivElement|null}
 */
const back = document.querySelector('.back');

/**
 * @type {HTMLInputElement|null}
 */
const inputCardholder = document.querySelector('#cardholder');

/**
 * @type {HTMLInputElement|null}
 */
const inputCardnumber = document.querySelector('#card-number');

/**
 * @type {HTMLInputElement|null}
 */
const inputMonth = document.querySelector('#month');

/**
* @type {HTMLInputElement|null}
*/
const inputYear = document.querySelector('#year');

/**
* @type {HTMLInputElement|null}
*/
const inputCVC = document.querySelector('#cvc');

/**
 * @type {HTMLParagraphElement|null}
 */
const pCardholder = document.querySelector('.card-holder');

/**
 * @type {HTMLParagraphElement|null}
 */
const pCardnumber = document.querySelector('.card-number');

/**
 * @type {HTMLSpanElement|null}
 */
const spanCVC = document.querySelector('.cvc');

/**
 * @type {HTMLSpanElement|null}
 */
const spanMonth = document.querySelector('.month');

/**
* @type {HTMLSpanElement|null}
*/
const spanYear = document.querySelector('.year');

/**
* @type {NodeListOf<HTMLParagraphElement>|null}
*/
const errorMessages = document.querySelectorAll('.error-message');



// **********************************************************************//
// ***********************  Table of content  ***************************//
// **********************************************************************//
// 
// 1. Events
//  1.1 Form
//  1.2 input Cardholder
//  1.3 input Cardnumber
//  1.4 input Month
//  1.5 input Year
//  1.6 input CVC
//  
// 2. Functions



// **********************************************************************//
// ****************************  Events  ********************************//
// **********************************************************************//


window.addEventListener('load', () => {
    rebuildPositionOfCard();
});

window.addEventListener('resize', () => {
    rebuildPositionOfCard();
});


// *************************** 1.1 Form *********************************//
// **********************************************************************//

form?.addEventListener('submit', (e) => {
    let isValid = true;

    errorMessages.forEach(element => {
        element.textContent = '';
    });

    inputCardholder?.removeAttribute('data-status');
    inputCardnumber?.removeAttribute('data-status');
    inputMonth?.removeAttribute('data-status');
    inputYear?.removeAttribute('data-status');
    inputCVC?.removeAttribute('data-status');

    // ************************  Cardholder Name **************************//

    if (inputCardholder) {
        /**
         * @type {String}
         */
        const value = inputCardholder.value.replace(/\s+/g, '');

        // if empty
        if (value === '') {
            inputCardholder.setAttribute('data-status', 'error');
            if (divCardHolder) {
                showErrorMessage("Can't be blank", divCardHolder);
                isValid = false;
            }
        }
    }

    // ********************************************************************//


    // **************************  Card Number  ***************************//

    if (inputCardnumber) {
        /**
         * @type {String}
         */
        const value = inputCardnumber.value.replace(/\s+/g, '');

        //  if less than 16
        if (value.length < 16) {
            inputCardnumber.setAttribute('data-status', 'error');
            if (divCardNumber) {
                showErrorMessage("Can't be less 16 digit", divCardNumber);
                isValid = false;
            }
        }

        // if empty
        if (value === '') {
            inputCardnumber.setAttribute('data-status', 'error');
            if (divCardNumber) {
                showErrorMessage("Can't be blank", divCardNumber);
                isValid = false;
            }
        }

        // if contain non-digit
        if (value.match(/\D/)) {
            if (divCardNumber) {
                inputCardnumber.setAttribute('data-status', 'error');
                showErrorMessage('Wrong format, numbers only', divCardNumber);
                isValid = false;
            }
        }

    }

    // ********************************************************************//


    // **************************   Month   *******************************//

    if (inputMonth?.value === '') {
        inputMonth.setAttribute('data-status', 'error');
        if (divExpDate) {
            showErrorMessage("Can't be blank", divExpDate);
            isValid = false;
        }
    }

    // ********************************************************************//


    // ***************************   Year   *******************************//

    if (inputYear?.value === '') {
        inputYear.setAttribute('data-status', 'error');
        if (divExpDate) {
            showErrorMessage("Can't be blank", divExpDate);
            isValid = false;
        }
    }

    // ********************************************************************//


    // *****************************  CVC  ********************************//

    if (inputCVC) {

        /**
         * @type {String}
         */
        const value = inputCVC.value;

        //  if less than 3
        if (value.length < 3) {
            inputCVC.setAttribute('data-status', 'error');
            if (divCVC) {
                showErrorMessage("Can't be less 3 digit", divCVC);
                isValid = false;
            }
        }

        if (inputCVC?.value === '') {
            inputCVC.setAttribute('data-status', 'error');
            if (divCVC) {
                showErrorMessage("Can't be blank", divCVC);
                isValid = false;
            }
        }
    }

    // ********************************************************************//

    if (sectionComplited?.hasAttribute('data-visibility')) {
        if (isValid) {
            sectionFormFill?.setAttribute('data-visibility', 'false');
            sectionComplited?.removeAttribute('data-visibility');
        }
        e.preventDefault();
        return false;
    }
});

// **********************************************************************//
// **********************************************************************//


// ******************** 1.2 input Cardholder *****************************//
// **********************************************************************//

inputCardholder?.addEventListener('keypress', (e) => {
    doNotTypeIfNotALetter(e);
});

inputCardholder?.addEventListener('input', () => {
    if (pCardholder && divCardHolder) {
        inputCardholder.removeAttribute('data-status');
        removeErrorMessage(divCardHolder);
        pCardholder.textContent = inputCardholder.value;
    }
});

// **********************************************************************//
// **********************************************************************//


// ******************* 1.3 input Cardnumber *****************************//
// **********************************************************************//

// inputCardnumber?.addEventListener('keypress', (e) => {
//     doNotTypeIfNotADigit(e);
// });

inputCardnumber?.addEventListener('keyup', () => {
    if (pCardnumber && divCardNumber) {
        inputCardnumber.removeAttribute('data-status');
        removeErrorMessage(divCardNumber);
        const text = inputCardnumber.value.replace(/\s+/g, '');
        const first = text.slice(0, 4);
        const second = text.slice(4, 8) != '' ? ' ' + text.slice(4, 8) : '';
        const third = text.slice(8, 12) != '' ? ' ' + text.slice(8, 12) : '';
        const fourth = text.slice(12, 16) != '' ? ' ' + text.slice(12, 16) : '';
        inputCardnumber.value = first + second + third + fourth;
        pCardnumber.textContent = inputCardnumber.value;
    }
});

// **********************************************************************//
// **********************************************************************//


// ************************ 1.4 input Month *****************************//
// **********************************************************************//

inputMonth?.addEventListener('keypress', (e) => {
    doNotTypeIfNotADigit(e);
});

inputMonth?.addEventListener('input', (e) => {
    if (spanMonth != null) {
        inputMonth.removeAttribute('data-status');
        if (checkFillExpDate() && divExpDate) {
            removeErrorMessage(divExpDate);
        }
        const inputValue = Number(inputMonth.value) > 12 ? '12' : inputMonth.value;
        inputMonth.value = inputValue;
        spanMonth.textContent = inputValue;
    }
});

inputMonth?.addEventListener('focusout', () => {
    if (spanMonth != null) {
        if (inputMonth.value[0] != '0' && (Number(inputMonth.value) >= 1 && Number(inputMonth.value) <= 9)) {
            const inputValue = '0' + inputMonth.value;
            inputMonth.value = inputValue;
            spanMonth.textContent = inputValue;
        }
    }
});

// **********************************************************************//
// **********************************************************************//


// ************************* 1.5 input Year *****************************//
// **********************************************************************//

inputYear?.addEventListener('keypress', (e) => {
    doNotTypeIfNotADigit(e);
});

inputYear?.addEventListener('input', () => {
    if (spanYear != null) {
        inputYear.removeAttribute('data-status');
        if (checkFillExpDate() && divExpDate) {
            removeErrorMessage(divExpDate);
        }
        spanYear.textContent = inputYear.value;
    }
});

inputYear?.addEventListener('focusout', () => {
    if (spanYear != null) {
        // add leader 0 if value [1, 9]
        if (inputYear.value[0] != '0' && (Number(inputYear.value) >= 1 && Number(inputYear.value) <= 9)) {
            const inputValue = '0' + inputYear.value;
            inputYear.value = inputValue;
            spanYear.textContent = inputValue;
        }
    }
});

// **********************************************************************//
// **********************************************************************//


// ************************* 1.6 input CVC *****************************//
// **********************************************************************//

inputCVC?.addEventListener('keypress', (e) => {
    doNotTypeIfNotADigit(e);
});

inputCVC?.addEventListener('input', () => {
    if (spanCVC && divCVC) {
        inputCVC.removeAttribute('data-status');
        removeErrorMessage(divCVC);
        spanCVC.textContent = inputCVC.value;
    }
});

// **********************************************************************//
// **********************************************************************//


// **********************************************************************//
// **********************************************************************//
// **********************************************************************//




// **********************************************************************//
// *************************  Functions  ********************************//
// **********************************************************************//

function checkFillExpDate() {
    if (inputMonth?.hasAttribute('data-status') ||
        inputYear?.hasAttribute('data-status')) {
        return false;
    };

    return true;
}


/** 
 * @param {KeyboardEvent} event 
 */
function doNotTypeIfNotADigit(event) {
    if (event.key.match(/\D/)) {
        event.preventDefault();
        return false;
    }
}

/** 
 * @param {KeyboardEvent} event 
 */
function doNotTypeIfNotALetter(event) {
    if (event.key.match(/[^a-zA-Z\s]/)) {
        event.preventDefault();
        return false;
    }
}

/**  
 * @param {HTMLDivElement} parent 
 */
function removeErrorMessage(parent) {
    const errorMessage = document.querySelector(`.${parent.className} .error-message`);
    if (errorMessage) {
        errorMessage.textContent = '';
    }
}

/** 
 * @param {String} message 
 * @param {HTMLDivElement} parent 
 */
function showErrorMessage(message, parent) {
    const errorMessage = document.querySelector(`.${parent.className} .error-message`);
    if (errorMessage) {
        errorMessage.textContent = message;
    }
}

function rebuildPositionOfCard() {

    if (window.matchMedia("(max-width: 75em)").matches) {
        front?.removeAttribute('style');
        back?.removeAttribute('style');
    }

    if (window.matchMedia("(min-width: 75em) and (max-width: 85em)").matches) {
        if (front) {
            front.style.left = '10%';
        }

        if (back) {
            back.style.left = '20%';
            back.style.top = '50%';
            back.style.margin = '0';
        }

    }

    if (window.matchMedia("(min-width: 85em) and (max-width: 95em)").matches) {
        if (front) {
            front.style.left = '20%';
        }

        if (back) {
            back.style.left = '30%';
            back.style.top = '50%';
            back.style.margin = '0';
        }

    }

    if (window.matchMedia("(min-width: 95em)").matches) {
        if (front) {
            front.style.left = '40%';
        }

        if (back) {
            back.style.left = '60%';
            back.style.top = '50%';
            back.style.margin = '0';
        }

    }
}

// **********************************************************************//
// **********************************************************************//
// **********************************************************************//