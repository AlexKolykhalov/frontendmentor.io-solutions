// @ts-check

/**
 * @type {NodeListOf<HTMLButtonElement>}
 */
const listControlBtns = document.querySelectorAll('.controll-btns button');

/**
 * @type {NodeListOf<HTMLLIElement>}
 */
const listBillingPlans = document.querySelectorAll('.billing-plans>li');

/**
 * @type {NodeListOf<HTMLButtonElement>}
 */
const listBillingPlansTimePeriodBtns = document.querySelectorAll('.billing-plans-time-period>button');

/**
* @type {HTMLInputElement|null}
*/
const toggle = document.querySelector('.toggle > input[type="checkbox"]');

/**
 * @type {NodeListOf<HTMLLIElement>}
 */
const listAddons = document.querySelectorAll('.addons>li');

/**
 * @type {HTMLInputElement|null}
 */
const inputName = document.querySelector('#name');

/**
 * @type {HTMLInputElement|null}
 */
const inputEmail = document.querySelector('#email');

/**
 * @type {HTMLInputElement|null}
 */
const inputPhone = document.querySelector('#phone');

/**
 * @type {HTMLAnchorElement|null}
 */
const changePlanLink = document.querySelector('.change-plan-link');

let yearlyBillingPlan = false;

// ************************** 1. Events *********************************//

//PWA
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));
}

listControlBtns.forEach((elem) => {
    if (elem.textContent === 'Next Step' || elem.textContent === 'Confirm') {
        elem.addEventListener('click', () => {
            nextStep();
        });
    }
    if (elem.textContent === 'Go Back') {
        elem.addEventListener('click', () => {
            nextStep(false);
        });
    }
});

listBillingPlans.forEach((elem) => {
    elem.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            if (elem.hasAttribute('data-status') === false) {
                const activeBill = document.querySelector('.billing-plans>li[data-status="active"]');
                activeBill?.removeAttribute('data-status');
                elem.setAttribute('data-status', 'active');
                updateCurrentBillingPlan();
            }
        }
    });

    elem.addEventListener('click', () => {
        if (elem.hasAttribute('data-status') === false) {
            const activeBill = document.querySelector('.billing-plans>li[data-status="active"]');
            activeBill?.removeAttribute('data-status');
            elem.setAttribute('data-status', 'active');
            updateCurrentBillingPlan();
        }
    });
});

listBillingPlansTimePeriodBtns.forEach((elem) => {
    elem.addEventListener('click', () => {
        if (elem.hasAttribute('data-status') === false) {
            const active = document.querySelector('.billing-plans-time-period>button[data-status="active"]')
            if (active && toggle) {
                active.removeAttribute('data-status');
                elem.setAttribute('data-status', 'active');
                yearlyBillingPlan = !yearlyBillingPlan;
                toggle.checked = yearlyBillingPlan;
                updateText();
                updateCurrentBillingPlan();
            }
        }
    });
});

listAddons.forEach((elem) => {
    elem.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            setCheckedStatus(elem);
        }
    });

    elem.addEventListener('click', () => {
        setCheckedStatus(elem);
        updateCurrentBillingPlan();
    });
});

changePlanLink?.addEventListener('click', () => {
    const currentStep = document.querySelector('ol~article:not([hidden])');
    const selectPlanStep = document.querySelector('#billing_plans');
    if (currentStep && selectPlanStep) {
        currentStep.setAttribute('hidden', '');
        selectPlanStep.removeAttribute('hidden');
        const listStepIndicators = document.querySelectorAll('.steps-list>li');
        const currentStepIndicator = document.querySelector('.steps-list>li[data-status="active"]');
        if (currentStepIndicator && listStepIndicators.length > 0) {
            listStepIndicators[1].setAttribute('data-status', 'active');
            currentStepIndicator.removeAttribute('data-status');
        }
    }
});

toggle?.addEventListener('click', () => {
    const active = document.querySelector('.billing-plans-time-period>button[data-status="active"]')
    const notActive = document.querySelector('.billing-plans-time-period>button:not([data-status="active"])')
    if (active && notActive) {
        active.removeAttribute('data-status');
        notActive.setAttribute('data-status', 'active');
        yearlyBillingPlan = !yearlyBillingPlan;
        updateText();
        updateCurrentBillingPlan();
    }
});

inputName?.addEventListener('input', () => {
    inputName.parentElement?.removeAttribute('data-status');
});

inputEmail?.addEventListener('input', () => {
    inputEmail.parentElement?.removeAttribute('data-status');
});

inputPhone?.addEventListener('input', (e) => {
    inputPhone.parentElement?.removeAttribute('data-status');
});

inputPhone?.addEventListener('keyup', (e) => {
    inputPhone.value = formatter(inputPhone.value);
});

// ************************* 2. Functions *******************************//

/**
 * Returns a formatted string, e.c. 1234567890->'+1 234 567 890'.
 * @param {string} str 
 */
function formatter(str) {
    const text = str.replace(/\s+/g, '').replace('+', '');
    const first = text.slice(0, 1) !== '' ? '+' + text.slice(0, 1) : '';
    const second = text.slice(1, 4) !== '' ? ' ' + text.slice(1, 4) : '';
    const third = text.slice(4, 7) !== '' ? ' ' + text.slice(4, 7) : '';
    let fourth = text.slice(7, 10) !== '' ? ' ' + text.slice(7, 10) : '';
    let five = '';
    if (text.length > 10) {
        fourth = text.slice(7, 9) !== '' ? ' ' + text.slice(7, 9) : '';
        five = text.slice(9, 11) !== '' ? ' ' + text.slice(9, 11) : '';
    }

    return first + second + third + fourth + five;
}

/**
 * 1. Moves forward/back to the next step of the multistep form.
 * 2. Changes the step indicators.
 * @param {boolean} next if `false` moving backward.
 */
function nextStep(next = true) {
    if (next === true) {
        // Error checking for the first step only
        let hasError = false;
        if (inputName && inputEmail && inputPhone) {
            if (inputEmail.value.match(/^[\w\-\.]+@[\w\-\.]+\.[a-z]{2,3}$/) === null) {
                inputEmail.parentElement?.setAttribute('data-status', 'error-email');
                hasError = true;
            }
            if (inputPhone.value.match(/^\+[\d\s]+$/) === null) {
                inputPhone.parentElement?.setAttribute('data-status', 'error-phone');
                hasError = true;
            }
            if (inputName.value.trim() === '') {
                inputName.parentElement?.setAttribute('data-status', 'error-empty-field');
                hasError = true;
            }
            if (inputEmail.value.trim() === '') {
                inputEmail.parentElement?.setAttribute('data-status', 'error-empty-field');
                hasError = true;
            }
            if (inputPhone.value.trim() === '') {
                inputPhone.parentElement?.setAttribute('data-status', 'error-empty-field');
                hasError = true;
            }
            if (hasError === true) {
                return false;
            }
        }
    }

    const currentStep = document.querySelector('ol~article:not([hidden])');
    const currentStepIndicator = document.querySelector('.steps-list>li[data-status="active"]');
    if (currentStep && currentStepIndicator) {
        currentStep.setAttribute('hidden', '');
        const listSteps = document.querySelectorAll('ol~article');
        const index = [...listSteps].indexOf(currentStep);
        listSteps[next ? index + 1 : index - 1].removeAttribute('hidden');

        currentStepIndicator.removeAttribute('data-status');
        const listStepIndicators = document.querySelectorAll('.steps-list>li');
        const index1 = [...listStepIndicators].indexOf(currentStepIndicator);
        if (listStepIndicators[next ? index1 + 1 : index1 - 1]) {
            listStepIndicators[next ? index1 + 1 : index1 - 1].setAttribute('data-status', 'active');
        }
    }
}

/**
 * 1. Changes attribute `data-status` on the `li` element.
 * 2. Updates `input.checked` inside the `li` element.
 * @param {HTMLLIElement} liElement
 */
function setCheckedStatus(liElement) {
    const input = liElement.querySelector('input');
    if (input) {
        input.checked = !input.checked;
        if (liElement.hasAttribute('data-status')) {
            liElement.removeAttribute('data-status');
        } else {
            liElement.setAttribute('data-status', 'checked');
        }
    }
}

/**
 * Updates text inside 'Select plan' and 'Add-ons' steps.
 */
function updateText() {
    const searchValue = yearlyBillingPlan ? '/mo' : '0/yr';
    const replaceValue = yearlyBillingPlan ? '0/yr' : '/mo';
    listBillingPlans.forEach((elem) => {
        const priceBillingPlan = elem.querySelector('h3+p');
        const descriptionBlockBillingPlan = priceBillingPlan?.parentElement;
        if (priceBillingPlan && priceBillingPlan.textContent) {
            priceBillingPlan.textContent = priceBillingPlan.textContent.replace(searchValue, replaceValue);
        }
        if (yearlyBillingPlan) {
            const adInfo = document.createElement('p');
            adInfo.className = 'adInfo { fs-d-300-400 clr-p-marine-blue }';
            adInfo.textContent = '2 month free';
            descriptionBlockBillingPlan?.appendChild(adInfo);
        } else {
            const adInfo = descriptionBlockBillingPlan?.querySelector('.adInfo');
            if (adInfo) {
                descriptionBlockBillingPlan?.removeChild(adInfo);
            }
        }
    });
    listAddons.forEach((elem) => {
        const priceAddon = elem.querySelector(':scope>p');
        if (priceAddon && priceAddon.textContent) {
            priceAddon.textContent = priceAddon.textContent.replace(searchValue, replaceValue);
        }
    });
}

/**
 * Updates info for the last step. 
 */
function updateCurrentBillingPlan() {
    let totalPrice = 0;
    const activeBill = document.querySelector('.billing-plans>li[data-status="active"]');
    if (activeBill) {
        const title = activeBill.querySelector('h3');
        const price = activeBill.querySelector('h3+p');
        if (title && title.textContent && price && price.textContent) {
            totalPrice = Number(price.textContent.slice(price.textContent.indexOf('$') + 1, price.textContent.indexOf('/')));

            const choosenBillingPlanTitle = document.querySelector('.choosen-billing-plan');
            const choosenBillingPlanPrice = document.querySelector('.choosen-billing-plan-price');
            if (choosenBillingPlanTitle && choosenBillingPlanPrice) {
                choosenBillingPlanTitle.textContent = `${title.textContent} (${yearlyBillingPlan ? 'Yearly' : 'Monthly'})`;
                choosenBillingPlanPrice.textContent = price.textContent;
            }
        }
    }
    const listChoosenAddons = document.querySelectorAll('.addons>li[data-status="checked"]')
    const elementChoosenAddons = document.querySelector('.choosen-addons');

    if (listChoosenAddons.length === 0 && elementChoosenAddons) {
        const elementHr = document.querySelector('hr');
        if (elementHr) {
            elementChoosenAddons.parentElement?.removeChild(elementHr);
            elementChoosenAddons.replaceChildren();
        }
    }

    if (listChoosenAddons.length > 0 && elementChoosenAddons) {
        elementChoosenAddons.replaceChildren();
        const elementHr = document.querySelector('hr');
        if (elementHr === null) {
            const elementHr = document.createElement('hr');
            elementChoosenAddons.parentElement?.insertBefore(elementHr, elementChoosenAddons);
        }

        listChoosenAddons.forEach((elem) => {
            const titleAddon = elem.querySelector('label');
            const priceAddon = elem.querySelector(':scope>p');
            if (titleAddon && priceAddon && titleAddon.textContent && priceAddon.textContent) {
                const newRow = document.createElement('div');
                newRow.className = 'row main-axis-space-between cross-axis-center';

                const titleChoosenAddon = document.createElement('p');
                titleChoosenAddon.className = 'fs-d-300-400 clr-n-400';
                titleChoosenAddon.textContent = titleAddon.textContent;
                newRow.appendChild(titleChoosenAddon);

                const priceChoosenAddon = document.createElement('p');
                priceChoosenAddon.className = 'fw-medium fs-d-300-400 clr-p-marine-blue';
                priceChoosenAddon.textContent = priceAddon.textContent;
                totalPrice = totalPrice + Number(priceAddon.textContent.slice(priceAddon.textContent.indexOf('$') + 1, priceAddon.textContent.indexOf('/')));
                newRow.appendChild(priceChoosenAddon);

                elementChoosenAddons.appendChild(newRow);
            }
        });
    }
    const elementTotalPrice = document.querySelector('.total-price');
    if (elementTotalPrice) {
        elementTotalPrice.textContent = `$${totalPrice.toString()}/${yearlyBillingPlan ? 'yr' : 'mo'}`;
    }
}