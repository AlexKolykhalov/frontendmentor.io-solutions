// @ts-check

/**
 * @type {HTMLFormElement|null}
 */
const form = document.querySelector('form');

/**
 * @type {HTMLInputElement|null}
 */
const email = document.querySelector('#email');

email?.addEventListener('input', () => {
    email.parentElement?.removeAttribute('data-status');
    email.style.background = 'hsla(218, 92%, 95%, 1)';
    if (email.value === '') {
        email.style.background = 'var(--clr-neutral-000)';
    }
});

form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (email != null) {

        let validEmail = true;

        const wrongSymbols = email.value.match(/@xn--|\.{2,}|\-{2,}|\-\.|\.\-/);
        const valid = email.value.match(/^[\w\-\.]+@[\w\-\.]+\.[a-z]{2,3}$/);
        if (email.value === '' || wrongSymbols || !valid) {
            validEmail = false;
            email.parentElement?.setAttribute('data-status', 'invalid');                
            const p = email.parentElement?.lastElementChild;
            if (p != null) {
                p.textContent = email.value === ''
                    ? 'Whoops! It looks like you forgot to add your email'
                    : 'Please provide a valid email address';
            }
        }

        if (validEmail) {
            form.submit();
        }
    }
});
