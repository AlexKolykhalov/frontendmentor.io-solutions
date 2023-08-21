// @ts-check

import { signIn } from "./repository.js";

/** DON'T FORGET <script src="main.js" defer></script> in HTML */
/**
* @type {HTMLButtonElement|null}
*/
const btn = document.querySelector('button');

// ************************** 1. Events *********************************//

btn?.addEventListener('click', () => {
    signIn();
});

// *************************** 1.1 Form *********************************//
// **********************************************************************//


// ************************* 2. Functions *******************************//
