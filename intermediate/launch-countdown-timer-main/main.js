// @ts-check

/**
* @type {HTMLBodyElement|null}
*/
const body = document.querySelector('body');

/**
* @type {NodeListOf<HTMLDivElement>}
*/
const listClockFaces = document.querySelectorAll('.clock-face');

/**
 * Start time in seconds 
 * @type {number}
 */
let counter = 86400;

let defaultSec = 0;
let defaultMin = 0;
let defaultHours = 0;
let defaultDays = 0;

let pauseInterval = false;

/**
 * @type {{ days:string, hours:string, minutes:string, seconds:string }}
 */
const timeFormat = { days: 'days', hours: 'hours', minutes: 'minutes', seconds: 'seconds' };

// ************************** 1. Events *********************************//

window.addEventListener('load', () => {
    setInitCountdownTime();
    const idInterval = setInterval(() => {
        if (pauseInterval) {
            return;
        }
        counter--;
        if (counter < 1) {
            clearInterval(idInterval);
        }

        const time = convertSeconds(counter);

        /**
        * @type {HTMLDivElement|null}
        */
        const clockFaceSeconds = document.querySelector('.clock-face.seconds');
        if (clockFaceSeconds) {
            animateFlipping(clockFaceSeconds);
            defaultSec = time.seconds;
        }

        if (defaultMin !== time.minutes) {
            /**
            * @type {HTMLDivElement|null}
            */
            const clockFaceMinutes = document.querySelector('.clock-face.minutes');
            if (clockFaceMinutes) {
                animateFlipping(clockFaceMinutes);
                defaultMin = time.minutes;
            }
        }

        if (defaultHours !== time.hours) {
            /**
            * @type {HTMLDivElement|null}
            */
            const clockFaceHours = document.querySelector('.clock-face.hours');
            if (clockFaceHours) {
                animateFlipping(clockFaceHours);
                defaultHours = time.hours;
            }
        }

        if (defaultDays !== time.days) {
            /**
            * @type {HTMLDivElement|null}
            */
            const clockFaceDays = document.querySelector('.clock-face.days');
            if (clockFaceDays) {
                animateFlipping(clockFaceDays);
                defaultDays = time.days;
            }
        }
        // console.log(`days: ${time.days} hours: ${time.hours} minutes: ${time.minutes} seconds: ${time.seconds}`);
    }, 1000);
});

document.addEventListener('visibilitychange', () => {
    pauseInterval = document.hidden ? true : false;
});

listClockFaces.forEach(clockFace => {
    /**
    * @type {HTMLDivElement|null}
    */
    const movingCard = clockFace.querySelector('.moving-card');

    if (movingCard) {
        movingCard.addEventListener('animationend', () => {
            let current = '00';
            let next = '00';
            if ([...clockFace.classList].includes('seconds')) {
                current = format(defaultSec, 'seconds');
                next = format(defaultSec - 1, 'seconds');
            }
            if ([...clockFace.classList].includes('minutes')) {
                current = format(defaultMin, 'minutes');
                next = format(defaultMin - 1, 'minutes');
            }
            if ([...clockFace.classList].includes('hours')) {
                current = format(defaultHours, 'hours');
                next = format(defaultHours - 1, 'hours');
            }
            if ([...clockFace.classList].includes('days')) {
                current = format(defaultDays, 'days');
                next = format(defaultDays - 1, 'days');
            }

            setClockFaceTime(clockFace, current, next);

            /**
            * @type {HTMLDivElement|null}
            */
            const clockFacePartBottom = clockFace.querySelector('.bottom');
            if (clockFacePartBottom) {
                clockFacePartBottom?.classList.remove('is-shaken');
                void clockFacePartBottom?.offsetWidth;
                clockFacePartBottom?.classList.add('is-shaken');
            }
        });
    }
});

// ************************* 2. Functions *******************************//

function setInitCountdownTime() {
    /**
    * @type {HTMLDivElement|null}
    */
    const clockFaceSeconds = document.querySelector('.clock-face.seconds');

    /**
    * @type {HTMLDivElement|null}
    */
    const clockFaceMinutes = document.querySelector('.clock-face.minutes');

    /**
    * @type {HTMLDivElement|null}
    */
    const clockFaceHours = document.querySelector('.clock-face.hours');

    /**
    * @type {HTMLDivElement|null}
    */
    const clockFaceDays = document.querySelector('.clock-face.days');

    const time = convertSeconds(counter);

    if (clockFaceSeconds) {
        const current = format(time.seconds, timeFormat.seconds);
        const next = format(time.seconds - 1, timeFormat.seconds);
        setClockFaceTime(clockFaceSeconds, current, next);
        defaultSec = time.seconds;
    }
    if (clockFaceMinutes) {
        const current = format(time.minutes, timeFormat.minutes);
        const next = format(time.minutes - 1, timeFormat.minutes);
        setClockFaceTime(clockFaceMinutes, current, next);
        defaultMin = time.minutes;
    }
    if (clockFaceHours) {
        const current = format(time.hours, timeFormat.hours);
        const next = format(time.hours - 1, timeFormat.hours);
        setClockFaceTime(clockFaceHours, current, next);
        defaultHours = time.hours;
    }
    if (clockFaceDays) {
        const current = format(time.days, timeFormat.days);
        const next = format(time.days - 1, timeFormat.days);
        setClockFaceTime(clockFaceDays, current, next);
        defaultDays = time.days;
    }
}

/**
 * @param {HTMLDivElement} clockFace 
 * @param {string} current 
 * @param {string} next 
 */
function setClockFaceTime(clockFace, current, next) {
    /**
    * @type {HTMLSpanElement|null}
    */
    const clockFacePartTopSpan = clockFace.querySelector('.top>span');

    /**
    * @type {HTMLSpanElement|null}
    */
    const clockFacePartBottomSpan = clockFace.querySelector('.bottom>span');

    /**
    * @type {HTMLDivElement|null}
    */
    const movingCard = clockFace.querySelector('.moving-card');

    if (movingCard) {
        /**
        * @type {HTMLSpanElement|null}
        */
        const movingCardFrontSpan = movingCard.querySelector('.front>span');

        /**
        * @type {HTMLSpanElement|null}
        */
        const movingCardBackSpan = movingCard.querySelector('.back>span');

        if (clockFacePartTopSpan && clockFacePartBottomSpan && movingCardFrontSpan && movingCardBackSpan) {
            clockFacePartTopSpan.textContent = next;
            clockFacePartBottomSpan.textContent = current;
            movingCardFrontSpan.textContent = current;
            movingCardBackSpan.textContent = next;
        }
    }
}

/**
 * Starts animation of flipping card inside of `clockFace` 
 * @param {HTMLDivElement} clockFace
 */
function animateFlipping(clockFace) {
    /**
    * @type {HTMLDivElement|null}
    */
    const movingCard = clockFace.querySelector('.moving-card');
    if (movingCard) {
        movingCard.classList.remove('is-flipped');
        void movingCard.offsetWidth;
        movingCard.classList.add('is-flipped');
    }
}

/**
 * Formated `num` according specific `type`.
 * @param {number} num Current number 
 * @param {string} type Type of time: 'seconds', 'minutes', 'hours', 'days' 
 */
function format(num, type) {

    if (type === timeFormat.seconds || type === timeFormat.minutes) {
        num = num < 0 ? 59 : num;
    }
    if (type === timeFormat.hours) {
        num = num < 0 ? 23 : num;
    }
    if (type === timeFormat.days) {
        num = num < 0 ? 29 : num;
    }

    return num > 9 ? num.toString() : '0' + num.toString();
}

/**
 * Converted `totalSeconds` to days, hours, minutes and seconds.
 * @param {number} totalSeconds  
 */
function convertSeconds(totalSeconds) {
    const minute = 60;
    const hour = 3600;
    const day = 86400;

    const days = Math.floor(totalSeconds / day);
    const hours = Math.floor((totalSeconds - days * day) / hour);
    const minutes = Math.floor((totalSeconds - days * day - hours * hour) / minute);
    const seconds = totalSeconds - days * day - hours * hour - minutes * minute;

    return {
        'days': days,
        'hours': hours,
        'minutes': minutes,
        'seconds': seconds,
    }
}

/**
 * Returns the value between two numbers at a specified, decimal midpoint,
 * e.g. lerp(20, 80, 0) => 20, lerp(20, 80, 0.5) => 50, lerp(20, 80, 1) => 80.
 * @param {number} x
 * @param {number} y
 * @param {number} a
 */
const lerp = (x, y, a) => x * (1 - a) + y * a;

/**
 * Clamps `a` between `min` and `max`.
 * If number falls within the bounds of the min & max, it’ll return it. 
 * If not, it’ll return either the minimum it’s smaller, or the maximum if it’s bigger.
 * @param {number} a 
 * @param {number} min 
 * @param {number} max 
 */
const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));

/**
 * Inverse lerp, this works in the opposite to the {@link lerp}.
 * Pass any number and it'll return that decimal,
 * e.g. invlerp(50, 100, 75) => 0.5
 * @param {number} x 
 * @param {number} y 
 * @param {number} a 
 */
const invlerp = (x, y, a) => clamp((a - x) / (y - x));

/**
 * Convert `a` from one data range to another,
 * e.g. range(10, 100, 2000, 20000, 50) => 10000
 * @param {number} x1 
 * @param {number} y1 
 * @param {number} x2 
 * @param {number} y2 
 * @param {number} a 
 */
const range = (x1, y1, x2, y2, a) => lerp(x2, y2, invlerp(x1, y1, a));