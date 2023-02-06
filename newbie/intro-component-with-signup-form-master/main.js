//@ts-check

/**
 * @type {HTMLInputElement|null}
 */
const firstName = document.querySelector('#first-name');

/**
 * @type {HTMLInputElement|null}
 */
const lastName = document.querySelector('#last-name');

/**
 * @type {HTMLInputElement|null}
 */
const email = document.querySelector('#email');

/**
 * @type {HTMLInputElement|null}
 */
const psw = document.querySelector('#password');

/**
 * @type {HTMLFormElement|null}
 */
const form = document.querySelector('form');

firstName?.addEventListener('input', () => {
    firstName.parentElement?.removeAttribute('data-status');
    firstName.style.background = 'hsla(218, 92%, 95%, 1)';
    if (firstName.value === '') {
        firstName.style.background = 'var(--clr-neutral-000)';
    }
});

lastName?.addEventListener('input', () => {
    lastName.parentElement?.removeAttribute('data-status');
    lastName.style.background = 'hsla(218, 92%, 95%, 1)';
    if (lastName.value === '') {
        lastName.style.background = 'var(--clr-neutral-000)';
    }
});

email?.addEventListener('input', () => {
    email.parentElement?.removeAttribute('data-status');
    email.style.background = 'hsla(218, 92%, 95%, 1)';
    if (email.value === '') {
        email.style.background = 'var(--clr-neutral-000)';
    }
});

psw?.addEventListener('input', () => {
    psw.parentElement?.removeAttribute('data-status');
    psw.style.background = 'hsla(218, 92%, 95%, 1)';
    if (psw.value === '') {
        psw.style.background = 'var(--clr-neutral-000)';
    }
});

form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if ((firstName != null) && (lastName != null) && (email != null) && (psw != null)) {
        let validFirstName = true;
        let validLastName = true;
        let validEmail = true;
        let validPsw = true;

        if (firstName.value.trim() === '') {
            firstName.parentElement?.setAttribute('data-status', 'warning');
            validFirstName = false;
        }

        if (lastName.value.trim() === '') {
            lastName.parentElement?.setAttribute('data-status', 'warning');
            validLastName = false;
        }

        const wrongSymbols = email.value.match(/@xn--|\.{2,}|\-{2,}|\-\.|\.\-/);
        const valid = email.value.match(/^[\w\-\.]+@[\w\-\.]+\.[a-z]{2,3}$/);
        if (email.value.trim() === '' || wrongSymbols || !valid) {
            validEmail = false;
            email.parentElement?.setAttribute('data-status', 'warning');
            const p = email.parentElement?.lastElementChild;
            if (p != null) {
                p.textContent = email.value.trim() === ''
                    ? 'Email Address cannot be empty'
                    : 'Looks like this is not email';
            }
        }

        if (psw.value === '') {
            validPsw = false;
            psw.parentElement?.setAttribute('data-status', 'warning');
        }

        if (validFirstName && validLastName && validEmail && validPsw) {
            form.submit();
        }
    }
});