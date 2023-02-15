// @ts-check

/**
 * @type {HTMLButtonElement|null}
 */
const bnt = document.querySelector('button');

/**
 * @type {NodeListOf<HTMLElement>|null}
 */
const listUnreadedNotifications = document.querySelectorAll('.notification[data-status="unreaded"]');

/**
 * @type {HTMLSpanElement|null}
 */
const output = document.querySelector('.output');

/**
 * @type {boolean}
 */
let isMobileView = window.matchMedia("(max-width: 40em)").matches;

/**
 * @type {Number}
 */
let count = listUnreadedNotifications.length;

/**
 * @type {Number}
 */
let touchstartX = 0;

/**
 * @type {Number}
 */
let touchendX = 0;

/**
 * @type {Number}
 */
let timeout;

window.addEventListener('resize', () => {
    isMobileView = window.matchMedia("(max-width: 40em)").matches;
});

listUnreadedNotifications.forEach(element => {
    element.addEventListener('mouseenter', () => {
        if (element.hasAttribute('data-status') && !isMobileView) {
            timeout = setTimeout(() => {
                element.removeAttribute('data-status');
                if (output != null) {
                    count--;
                    if (count === 0) {
                        output.style.display = 'none';
                    }
                    output.textContent = count.toString();
                }
            }, 1000);
        }
    });

    element.addEventListener('mouseleave', () => {
        if (element.hasAttribute('data-status')) {
            clearTimeout(timeout);
        }
    });

    element.addEventListener('touchstart', (e) => {
        touchstartX = e.changedTouches[0].screenX;
    });

    element.addEventListener('touchend', (e) => {
        touchendX = e.changedTouches[0].screenX;
        checkDirection(element);
    })
});

bnt?.addEventListener('click', () => {
    if (count > 0) {
        count = 0;
        listUnreadedNotifications.forEach((element, i) => {
            if (element.hasAttribute('data-status')) {
                setTimeout(() => {
                    if (isMobileView) {
                        swipeAnimation(element);
                    } else {
                        element.removeAttribute('data-status');
                    }
                }, 100 * i);
            }
        });
        if (output != null) {
            output.style.display = 'none';
        }
    }
});

/**      
 * @param {HTMLElement} element 
 */
function checkDirection(element) {
    // swiped left
    if ((touchendX < touchstartX) && element.hasAttribute('data-status')) {
        swipeAnimation(element);
        if (output != null) {
            count--;
            if (count === 0) {
                output.style.display = 'none';
            }
            output.textContent = count.toString();
        }
    }
}

/**
 * @param {HTMLElement} element
 */
function swipeAnimation(element) {
    element.style.transform = 'translateX(-20px)';
    element.addEventListener('transitionend', () => {
        element.style.transform = 'translateX(0px)';
        element.removeAttribute('data-status');
    });
}