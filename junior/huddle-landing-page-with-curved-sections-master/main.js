// @ts-check


/**
* @type {HTMLDivElement|null}
*/
const div = document.querySelector('.email-input');

/**
* @type {HTMLInputElement|null}
*/
const input = document.querySelector('#email');

/**
* @type {HTMLFormElement|null}
*/
const form = document.querySelector('form');

// ************************** 1. Events *********************************//

form?.addEventListener('submit', (e) => {
    if (input?.value.match(/^[\w\-\.]+@[\w\-\.]+\.[a-z]{2,3}$/) === null) {
        e.preventDefault();
        div?.setAttribute('data-status', 'error');
    } else {
        div?.removeAttribute('data-status');
    }
});

input?.addEventListener('input', () => {
    div?.removeAttribute('data-status');
});