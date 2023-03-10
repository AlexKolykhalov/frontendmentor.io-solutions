// @ts-check


/**
* @type {HTMLButtonElement|null}
*/
const btn = document.querySelector('.advice-card-button');

/**
* @type {HTMLSpanElement|null}
*/
const adviceNumber = document.querySelector('.advice-number');

/**
* @type {HTMLParagraphElement|null}
*/
const adviceText = document.querySelector('.advice-card-text');

// **********************************************************************//
// ***********************  Table of content  ***************************//
// **********************************************************************//
// 
// 1. Events
//  1.1 Button
//  
// 2. Functions




// **********************************************************************//
// ************************** 1. Events *********************************//
// **********************************************************************//


// *************************** 1.1 Button *********************************//
// **********************************************************************//
btn?.addEventListener('click', async () => {
    try {
        const response = await fetch('https://api.adviceslip.com/advice');
        const advice = await response.json();
        if (adviceNumber && adviceText) {
            adviceNumber.textContent = advice.slip.id;
            adviceText.textContent = advice.slip.advice;
        }
    } catch (error) {
        if (adviceNumber && adviceText) {
            adviceNumber.textContent = '404';
            adviceText.textContent = 'Something went wrong. Try again later.';
        }
    }
});


// **********************************************************************//
// **********************************************************************//
// **********************************************************************//




// **********************************************************************//
// **********************************************************************//
// **********************************************************************//


// ************************* 2. Functions *******************************//
// **********************************************************************//


// **********************************************************************//
// **********************************************************************//
// **********************************************************************//
