// @ts-check


/**
* @type {HTMLButtonElement|null}
*/
const btn = document.querySelector('button.cta');

/**
* @type {HTMLButtonElement|null}
*/
const div = document.querySelector('.email-signup .relative');

/**
* @type {HTMLButtonElement|null}
*/
const input = document.querySelector('.email-signup input');

// ************************** 1. Events *********************************//

input?.addEventListener('input', () => {
    div?.removeAttribute('data-status');
});

btn?.addEventListener('click', () => {
    // check email address 
    if (input?.value.match(/^[\w\-\.]+@[\w\-\.]+\.[a-z]{2,3}$/) === null) {
        div?.setAttribute('data-status', 'error');
    } else {
        div?.setAttribute('data-status', 'success');
    }
});