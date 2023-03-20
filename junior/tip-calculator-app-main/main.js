// @ts-check


/**
* @type {HTMLDivElement|null}
*/
const divNumberOfPeople = document.querySelector('.input-number-of-people');

/**
* @type {HTMLInputElement|null}
*/
const bill = document.querySelector('#bill');

/**
* @type {HTMLInputElement|null}
*/
const numberOfPeople = document.querySelector('#number-of-people');

/**
* @type {HTMLInputElement|null}
*/
const customTip = document.querySelector('#custom-tip');

/**
* @type {HTMLOutputElement|null}
*/
const outputTipAmount = document.querySelector('.tip-amount');

/**
* @type {HTMLOutputElement|null}
*/
const outputTotal = document.querySelector('.total');

/**
* @type {NodeListOf<HTMLButtonElement>|null}
*/
const tips = document.querySelectorAll('.tips button');

/**
* @type {HTMLButtonElement|null}
*/
const reset = document.querySelector('button[type="reset"]');

/**
* @type {number}
*/
let billValue = 0;

/**
* @type {number}
*/
let tipValue = 0;

/**
* @type {number}
*/
let numberOfPeopleValue = 0;


// **********************************************************************//
// ***********************  Table of content  ***************************//
// **********************************************************************//
//
// 1. Events
//  1.1 Bill
//  1.2 NumberOfPeople
//  1.3 CustomTip
//  1.4 Tips UL list
//  1.5 Reset
//
// 2. Functions


// **********************************************************************//
// ************************** 1. Events *********************************//
// **********************************************************************//


// *************************** 1.1 Bill *********************************//
// **********************************************************************//

bill?.addEventListener('keydown', (e) => {
    const str = getNewString(bill, e.key);

    // in this condition we allow leading zero
    if (str.match(/^\d{0,5}[\.\,]\d{0,2}$|^\d{0,4}\d?$/) === null) {
        e.preventDefault();
        return false;
    }
});

bill?.addEventListener('input', () => {
    bill.value = bill.value.replace(',', '.');
    if (bill.value === '.' || bill.value === '0.00') {
        bill.value = '';
    }
    // prevent leading zero
    if (bill.value.match(/^0$|^[\.\,]$|^[1-9]\d{0,4}[\.\,]\d{0,2}$|^[1-9]\d{0,3}\d?$|^0?[\.\,]\d{0,2}$/) === null) {
        // Number(bill.value) remove leading zero
        bill.value = bill.value ? Number(bill.value).toString() : '';
    }
    billValue = Number(bill.value);
    if (numberOfPeopleValue > 0) {
        calculate();
        divNumberOfPeople?.removeAttribute('data-status');
    }
    if (numberOfPeopleValue === 0) {
        divNumberOfPeople?.setAttribute('data-status', 'error');
    }
    if (billValue === 0 && numberOfPeopleValue === 0) {
        divNumberOfPeople?.removeAttribute('data-status');
    }
});

// ********************** 1.2 NumberOfPeople ****************************//
// **********************************************************************//

numberOfPeople?.addEventListener('keydown', (e) => {
    const str = getNewString(numberOfPeople, e.key);
    // 100 or less (allow leading zero)
    if (str.match(/^100$|^[0]?\d?\d?$/) === null) {
        e.preventDefault();
        return false;
    }
});

numberOfPeople?.addEventListener('input', () => {
    numberOfPeopleValue = Number(numberOfPeople.value);
    numberOfPeople.value = numberOfPeopleValue === 0 ? '' : numberOfPeopleValue.toString();
    calculate();
    if (numberOfPeopleValue > 0) {
        divNumberOfPeople?.removeAttribute('data-status');
    }
    if (numberOfPeopleValue === 0) {
        divNumberOfPeople?.setAttribute('data-status', 'error');
    }
    if (billValue === 0 && numberOfPeopleValue === 0) {
        divNumberOfPeople?.removeAttribute('data-status');
    }
});

// ********************** 1.3 CustomTip *********************************//
// **********************************************************************//

customTip?.addEventListener('keydown', (e) => {
    const str = getNewString(customTip, e.key);
    // 100 or less (allow leading zero)
    if (str.match(/^100$|^[0]?\d?\d?$/) === null) {
        e.preventDefault();
        return false;
    }
});

customTip?.addEventListener('input', () => {
    tipValue = Number(customTip.value);
    customTip.value = tipValue === 0 ? '' : tipValue.toString();
    calculate();
});

customTip?.addEventListener('focusin', () => {
    if (tipValue !== Number(customTip.value)) {
        tipValue = Number(customTip.value);
        tips.forEach(element => {
            element.removeAttribute('data-status');
        });
        calculate();
    }
});

// ********************** 1.4 Tips UL list ******************************//
// **********************************************************************//

tips.forEach(element => {
    element.addEventListener('click', () => {
        tipValue = Number(element.value);
        if (customTip && Number(customTip.value) > 0) {
            customTip.value = '';
        }
        if (element.hasAttribute('data-status')) {
            element.removeAttribute('data-status');
            tipValue = 0;
        } else {
            tips.forEach(element => {
                element.removeAttribute('data-status');
            });
            element.setAttribute('data-status', 'selected');
        }
        calculate();
    });
});

// ************************* 1.5 Reset **********************************//
// **********************************************************************//

reset?.addEventListener('click', () => {
    clean();
});

// **********************************************************************//
// **********************************************************************//
// **********************************************************************//




// **********************************************************************//
// **********************************************************************//
// **********************************************************************//


// ************************* 2. Functions *******************************//
// **********************************************************************//

function calculate() {
    if (numberOfPeopleValue) {
        if (outputTipAmount && outputTotal) {
            const tip = ((billValue * tipValue / 100) / numberOfPeopleValue).toFixed(2);
            const total = ((billValue + billValue * tipValue / 100) / numberOfPeopleValue).toFixed(2);
            outputTipAmount.textContent = `$${tip}`;
            outputTotal.textContent = `$${total}`;
        }
    } else {        
        if (outputTipAmount && outputTotal) {
            outputTipAmount.textContent = `$0.00`;
            outputTotal.textContent = `$0.00`;
        }
    }
}

function clean() {
    if (tips && outputTipAmount && outputTotal) {
        tips.forEach(element => {
            element.removeAttribute('data-status');
        });

        billValue = 0;
        tipValue = 0;
        numberOfPeopleValue = 0;

        outputTipAmount.textContent = `$0.00`;
        outputTotal.textContent = `$0.00`;
        divNumberOfPeople?.removeAttribute('data-status');
    }
}

/**
 * Returns modify string after selection in input
 * @param {HTMLInputElement} input
 * @param {string} key
 */
function getNewString(input, key) {

    const text = input.value;
    const indexStart = input.selectionStart ? input.selectionStart : 0;
    const indexEnd = input.selectionEnd ? input.selectionEnd : 0;
    const selectedSubstring = input.value.substring(indexStart, indexEnd);

    let pasteSymbol = key;

    if (pasteSymbol === 'Home' ||
        pasteSymbol === 'End' ||
        pasteSymbol === 'ArrowLeft' ||
        pasteSymbol === 'ArrowRight') {
        pasteSymbol = selectedSubstring ? selectedSubstring : '';
    }

    let str = text.slice(0, indexStart) + pasteSymbol + text.slice(indexEnd);

    if (pasteSymbol === 'Delete') {
        if (selectedSubstring === '') {
            str = text.slice(0, indexStart) + text.slice(indexStart + 1);
        } else {
            str = text.slice(0, indexStart) + text.slice(indexEnd);
        }
    }

    if (pasteSymbol === 'Backspace') {
        if (selectedSubstring === '') {
            str = text.slice(0, indexStart - 1) + text.slice(indexStart);
        } else {
            str = text.slice(0, indexStart) + text.slice(indexEnd);
        }
    }

    return str;
}
// **********************************************************************//
// **********************************************************************//
// **********************************************************************//
