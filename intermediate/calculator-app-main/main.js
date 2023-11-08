// @ts-check

/**
* @type {HTMLInputElement|null}
*/
const slider = document.querySelector('input[type="range"]');

/**
* @type {HTMLOutputElement|null}
*/
const output = document.querySelector('output');

/**
* @type {NodeListOf<HTMLButtonElement>}
*/
const listBtns = document.querySelectorAll('.grid button');

/**
 * Right operand.
 * @type {string}
 */
let a = '';

/**
 * Left operand
 * @type {string}
 */
let b = '';

/**
 * @type {string}
 */
let operation = '';

/**
 * @type {string}
 */
let symbol = '';

// ************************** 1. Events *********************************//

window.addEventListener('load', () => {
    const currentTheme = localStorage.getItem('theme');
    if (slider) {
        if (currentTheme === null) {
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                document.documentElement.setAttribute('data-theme', '3');
                slider.value = '3';
            }
        }
        if (currentTheme) {
            document.documentElement.setAttribute('data-theme', currentTheme);
            slider.value = currentTheme;
        }
    }
});

window.addEventListener('resize', () => {
    calculateOutputFontSize();
});

window.addEventListener('keyup', (e) => {
    const num = getKeyNumber(e.key);
    if (num !== '-1') {
        /**@type {HTMLButtonElement|null} */
        const btn = document.querySelector(`.grid>li:nth-of-type(${num})>button`);
        btn?.removeAttribute('data-status');
    }
});

window.addEventListener('keydown', (e) => {
    const num = getKeyNumber(e.key);
    if (num !== '-1') {
        /**@type {HTMLButtonElement|null} */
        const btn = document.querySelector(`.grid>li:nth-of-type(${num})>button`);
        btn?.setAttribute('data-status', 'active');
        btn?.click();
    }
});

window.addEventListener('touchstart', (e) => {
    const btn = e.targetTouches[0].target;
    // @ts-ignore
    btn.setAttribute('data-status', 'active');
});

window.addEventListener('touchend', (e) => {
    const btn = e.changedTouches[0].target;
    // @ts-ignore
    btn.removeAttribute('data-status');
});

slider?.addEventListener('input', (e) => {
    // @ts-ignore
    localStorage.setItem('theme', e.target?.value);
    // @ts-ignore
    document.documentElement.setAttribute('data-theme', e.target?.value);
});

listBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (e.target && output) {

            // @ts-ignore
            symbol = e.target.textContent;
            // console.log(`symbol: ${symbol}`);

            if (symbol === '=' && a !== '' && b !== '') {
                // prevent from division by 0 
                if (operation === '/' && b === '0') {
                    a = '';
                    b = '';
                    operation = '';
                    output.value = `Err`;

                    return false;
                }

                executeCalculation()
                // set new ariphmetic operation
                operation = '';
                b = a;
                a = '';
                output.value = `${a} ${operation} ${b}`;
                removeFocusFromTheActiveElement();

                return false;
            }

            if (symbol === 'del') {
                const str = output.value.trim().slice(0, -1).trim();
                if (str.length > 0) {
                    if (b.length === 0) {
                        operation = '';
                        b = a;
                        a = '';
                    } else {
                        b = b.slice(0, -1);
                    }
                    output.value = `${str}`;
                }

                if (str.length === 0) {
                    b = '';
                    output.value = '0';
                    output.setAttribute('data-status', 'empty');
                }
                calculateOutputFontSize();

                return false;
            }

            if (symbol === 'reset') {
                a = '';
                b = '';
                operation = '';
                output.value = '0';
                output.setAttribute('data-status', 'empty');
                calculateOutputFontSize();

                return false;
            }

            // negative value
            if (symbol === '-' && a === '' && b === '' && operation === '') {
                b = symbol;
                output.value = symbol;
                output.removeAttribute('data-status');

                return false;
            }

            if (symbol === '+' || symbol === '-' || symbol === 'x' || symbol === '/') {
                // prevent from double clicking on operator
                if (a !== '' && b === '') {
                    // set new ariphmetic operation
                    operation = symbol;
                    output.value = `${a} ${operation} ${b}`;

                    return false;
                }

                // prevent from division by 0 
                if (a !== '' && operation === '/' && b === '0') {
                    a = '';
                    b = '';
                    operation = '';
                    output.value = `Err`;

                    return false;
                }

                executeCalculation()
                // set new ariphmetic operation
                operation = symbol;
                output.value = `${a} ${operation} ${b}`;
                removeFocusFromTheActiveElement();

                return false;
            }

            const result = (b + symbol)
                .replace(',', '.')
                .replace(RegExp('^0+'), '0') // remove leading 00
                .replace(RegExp('^0\\d+'), symbol) // remove leading 0<any digit>
                .replace(RegExp('^\\.$'), '0.') // first '.' replace to 0.
                .replace(RegExp('\\.\\d{4}'), 'NaN'); // disable 4 digit after '.'

            if (isNaN(Number(result)) === true || result.length > 12) {
                return false;
            }

            b = result.replace('.', ',');
            output.value = `${a} ${operation} ${b}`.trim();
            output.removeAttribute('data-status');
            calculateOutputFontSize();
            removeFocusFromTheActiveElement();
        }
    });
});

// ************************* 2. Functions *******************************//

/**
 * Set new font-size according with `output.value.length`.
 */
function calculateOutputFontSize() {
    if (output) {
        output.classList.remove('fs-100', 'fs-200', 'fs-300', 'fs-400', 'fs-500');
        const length = output.value.length;
        let step1 = { 'max': 11, 'fs': 'fs-500' };
        let step2 = { 'max': 16, 'fs': 'fs-400' };
        let step3 = { 'max': 28, 'fs': 'fs-200' };
        let step4 = { 'max': 28, 'fs': 'fs-100' };
        if (window.matchMedia("(min-width: 48em)").matches) {
            step1 = { 'max': 22, 'fs': 'fs-500' };
            step2 = { 'max': 29, 'fs': 'fs-400' };
            step3 = { 'max': 32, 'fs': 'fs-300' };
            step4 = { 'max': 32, 'fs': 'fs-300' };
        }
        if (length < step1.max) {
            output.classList.add(step1.fs);
        }
        if (length >= step1.max && length < step2.max) {
            output.classList.add(step2.fs);
        }
        if (length >= step2.max && length < step3.max) {
            output.classList.add(step3.fs);
        }
        if (length >= step3.max) {
            output.classList.add(step4.fs);
        }
    }
}

/**
 * Calculate two operands with current ariphmetic operation.
 */
function executeCalculation() {
    let right = Number(a.replace(',', '.'));
    let left = Number(b.replace(',', '.'));

    if (operation === '') {
        right = left;
    }
    if (operation === '+') {
        right = Number((right + left).toFixed(3));
    }
    if (operation === '-') {
        right = Number((right - left).toFixed(3));
    }
    if (operation === 'x') {
        right = Number((right * left).toFixed(3));
    }
    if (operation === '/') {
        right = Number((right / left).toFixed(3));
    }

    a = right.toString().replace('.', ',');
    b = '';
    // console.log(`a: ${a} b: ${b}`);
}

/**
 * Returns the number from 0 to 18 by current `e.key`, and -1 overwise.
 * 
 * @param {string} key 
 */
function getKeyNumber(key) {
    let num = '-1';
    if (key === '0' ||
        key === '1' ||
        key === '2' ||
        key === '3' ||
        key === '4' ||
        key === '5' ||
        key === '6' ||
        key === '7' ||
        key === '8' ||
        key === '9'
    ) {
        num = (Number(key) + 1).toString();
    }
    if (key === '+') {
        num = '11';
    }
    if (key === '-') {
        num = '12';
    }
    if (key === '/') {
        num = '13';
    }
    if (key === '*') {
        num = '14';
    }
    if (key === '.' || key === ',') {
        num = '15';
    }
    if (key === 'Delete') {
        num = '17';
    }
    if (key === 'Backspace') {
        num = '16';
    }
    if (key === 'Enter' || key === '=') {
        num = '18';
    }
    return num;
}

/**
 * Remove focus from the active element to 
 * prevent unwanted triggiring.
 */
function removeFocusFromTheActiveElement() {
    // @ts-ignore
    document.activeElement?.blur();
}