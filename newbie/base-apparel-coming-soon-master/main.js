// @ts-check

/**
 * @type {HTMLImageElement|null}
 */
const img = document.querySelector('.photo>img');

/**
 * @type {HTMLInputElement|null}
 */
const input = document.querySelector('input');

/**
 * @type {HTMLButtonElement|null}
 */
const btn = document.querySelector('button');

/**
 * @type {HTMLFormElement|null}
 */
const form = document.querySelector('form');

/**
 * @type {HTMLSpanElement|null} 
*/
const warningIcon = document.querySelector('.warning-icon');

/**
 * @type {HTMLSpanElement|null} 
*/
const warningText = document.querySelector('.warning-text');

function resizePhoto() {
    if (img != null) {
        img.style.minHeight = '0px';
        if (window.matchMedia("(min-width: 1000px)").matches) {
            img.style.minHeight = `${document.documentElement.scrollHeight}px`;
        }
    }
}

window.addEventListener('load', () => {
    resizePhoto();
});

window.addEventListener('resize', () => {
    resizePhoto();
});

input?.addEventListener('input', () => {
    warningIcon?.setAttribute('hidden', '');
    warningText?.setAttribute('hidden', '');
    input.style.border = '1px solid var(--clr-primary-300)';
});

form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input != null) {
        const wrongSymbols = input.value.match(/@xn--|\.{2,}|\-{2,}|\-\.|\.\-/);
        const valid = input.value.match(/^[\w\-\.]+@[\w\-\.]+\.[a-z]{2,3}$/);
        if (!wrongSymbols && valid) {
            form.submit();
        } else {
            warningIcon?.removeAttribute('hidden');
            warningText?.removeAttribute('hidden');
            input.style.border = '2px solid var(--clr-primary-400)';
        }
    }
});
