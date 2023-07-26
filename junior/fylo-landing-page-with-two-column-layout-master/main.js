// @ts-check

/**
* @type {HTMLInputElement|null}
*/
const emailMainInput = document.querySelector('#email');

/**
* @type {HTMLInputElement|null}
*/
const emailAsideInput = document.querySelector('#email-aside');

/**
* @type {HTMLDivElement|null}
*/
const divForInputMain = document.querySelector('.email-main');

/**
* @type {HTMLDivElement|null}
*/
const divForInputAside = document.querySelector('.email-aside');

/**
* @type {HTMLButtonElement|null}
*/
const btn = document.querySelector('.email-main + button');

/**
* @type {HTMLButtonElement|null}
*/
const btnAside = document.querySelector('.email-aside + button');

// ************************** 1. Events *********************************//

window.addEventListener('load', () => {
    checkWidthAndSetStatus();
});

window.addEventListener('resize', () => {
    checkWidthAndSetStatus();
});

btn?.addEventListener('click', () => {
    const valid = checkEmail(emailMainInput?.value);
    valid ?
        removeErrorStatus(divForInputMain) :
        setErrorStatus(divForInputMain)
});

btnAside?.addEventListener('click', () => {
    const valid = checkEmail(emailAsideInput?.value);
    valid ?
        removeErrorStatus(divForInputAside) :
        setErrorStatus(divForInputAside)
});

emailMainInput?.addEventListener('input', () => {
    removeErrorStatus(divForInputMain);
});

emailAsideInput?.addEventListener('input', () => {
    removeErrorStatus(divForInputAside);
});

// ************************* 2. Functions *******************************//

/**
 * @param {string|undefined} value
 */
function checkEmail(value) {
    if (value?.match(/^[\w\-\.]+@[\w\-\.]+\.[a-z]{2,3}$/) === null) {
        return false;
    }
    return true;
}

/**
 * @param {HTMLDivElement|null} div
 */
function setErrorStatus(div) {
    div?.setAttribute('data-status', 'error');
}

/**
 * @param {HTMLDivElement|null} div
 */
function removeErrorStatus(div) {
    div?.removeAttribute('data-status');
}

function checkWidthAndSetStatus() {
    /**
    * @type {HTMLDivElement|null|undefined}
    */
    const div = divForInputMain?.closest('.row');
    if (div) {
        // 36*16 = 36em = --br-sm
        div.offsetWidth > 36 * 16 ?
            btn?.removeAttribute('data-status') :
            btn?.setAttribute('data-status', 'unfixed')
    }
}