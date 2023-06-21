/**
* @type {HTMLInputElement | null}
*/
const range = document.querySelector('#slider_bar');

/**
* @type {HTMLOutputElement | null}
*/
const output = document.querySelector('output');

/**
* @type {HTMLOutputElement | null}
*/
const usedGB = document.querySelector('.used-gb');

window.addEventListener('load', () => {
    output.value = 1000;
    usedGB.textContent = '0 GB';
    range.value = 0;
});

window.addEventListener('resize', () => {
    calculatePosition(range.value);
});

range?.addEventListener('input', (e) => {
    if (e.target) {
        calculatePosition(e.target.value);
        output.value = 1000 - e.target.value;
        usedGB.textContent = e.target.value + 'GB';
    }
});

/**
* @param {number} inputRangeValue
*/
function calculatePosition(inputRangeValue) {
    //1.1rem
    const widthThumb = 1.1 * 16;
    const widthInputRange = range.clientWidth;
    const currentWidth = widthInputRange - widthThumb;
    const r = currentWidth / widthInputRange;
    const delta = inputRangeValue > 5 ? 4.75 : 0;

    range.style.setProperty('--thumb', inputRangeValue * r / 10 + "%");
    range.style.setProperty('--progress', inputRangeValue * r / 10 + delta + "%");
}