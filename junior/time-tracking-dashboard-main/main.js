// @ts-check


/**
* @type {NodeListOf<HTMLLIElement>|null}
*/
const timeframes = document.querySelectorAll('.timeframes button');

/**
* @type {HTMLUListElement|null}
*/
const activities = document.querySelector('.activities');

/**
 * @type {Array}
 */
const daily = [];

/**
 * @type {Array}
 */
const weeekly = [];

/**
 * @type {Array}
 */
const monthly = [];

/**
* @type {HTMLParagraphElement|null}
*/
let currentHours;

/**
* @type {HTMLParagraphElement|null}
*/
let previousHours;

/**
* @type {[{
*   title:string, 
*   timeframes:{
*       daily: { current: string; previous: string; }, 
*       weekly: { current: string; previous: string; }, 
*       monthly: { current: string; previous: string; }
*   }
* }]}
*/
let data = [{
    title: '',
    timeframes: {
        daily: { current: '', previous: '' },
        weekly: { current: '', previous: '' },
        monthly: { current: '', previous: '' },
    }
}];

// **********************************************************************//
// ***********************  Table of content  ***************************//
// **********************************************************************//
//
// 1. Events
//  1.1 .timeframes li
//
// 2. Functions



// **********************************************************************//
// ************************** 1. Events *********************************//
// **********************************************************************//

window.addEventListener('load', async () => {
    try {
        const response = await fetch('data.json');
        data = await response.json();

        data.forEach(element => {
            daily.push({
                title: element.title,
                timeframes: element.timeframes.daily
            });

            weeekly.push({
                title: element.title,
                timeframes: element.timeframes.weekly
            });

            monthly.push({
                title: element.title,
                timeframes: element.timeframes.monthly
            });

            const li = document.createElement('li');
            const article = document.createElement('article');
            const div = document.createElement('div');
            const h2 = document.createElement('h2');
            const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            const svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const p1 = document.createElement('p');
            const p2 = document.createElement('p');

            const currentClassName = element.title.toLocaleLowerCase().replace(' ', '-');

            li.className = `${currentClassName} | radius`;
            
            // article.className = `${currentClassName} | radius`;
            div.className = 'indicators | radius | bg-clr-n-800';
            h2.className = 'title | clr-n-000 | fs-m fw-normal';
            h2.textContent = element.title;

            svgIcon.setAttribute('fill', 'currentColor');
            svgIcon.setAttribute('fill-rule', 'evenodd');
            svgIcon.setAttribute('width', '21');
            svgIcon.setAttribute('height', '15');
            svgIcon.classList.add('options');
            svgPath.setAttribute(
                'd',
                'M2.5 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm8 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm8 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z'
            );
            svgIcon.appendChild(svgPath);

            p1.className = 'current-hours | clr-n-000 | fs-x-l fw-light';
            p1.textContent = `${element.timeframes.daily.current}hrs`;

            p2.className = 'previous-hours | clr-n-400 | fs-sm';
            p2.textContent = `Last Day - ${element.timeframes.daily.previous}hrs`;

            div.appendChild(h2);
            div.appendChild(svgIcon);
            div.appendChild(p1);
            div.appendChild(p2);

            article.appendChild(div);
            li.appendChild(article);
            activities?.appendChild(li);
        });

    } catch (error) {
        const li = document.createElement('li');
        const article = document.createElement('article');
        const div = document.createElement('div');
        const h2 = document.createElement('h2');
        const p = document.createElement('p');
        const empty1 = document.createElement('p');
        const empty2 = document.createElement('p');

        article.className = `error | radius`;
        div.className = 'indicators | radius | bg-clr-n-800';
        h2.className = 'title | clr-n-000 | fs-m fw-normal';
        h2.textContent = 'Error';
        p.className = 'clr-n-000 | fs-x-l fw-light';
        p.textContent = 'Something went wrong. Try again.';

        div.appendChild(h2);
        div.appendChild(empty1);
        div.appendChild(p);
        div.appendChild(empty2);
        article.appendChild(div);
        li.appendChild(article);
        activities?.appendChild(li);
    }

});

// *********************** 1.1 .timeframes li ***************************//
// **********************************************************************//

timeframes.forEach(element => {
    element.addEventListener('click', () => {
        if (!element.hasAttribute('data-status')) {
            timeframes.forEach(element => {
                element.removeAttribute('data-status');
            });
            element.setAttribute('data-status', 'selected');
            if (element.textContent) {
                updateDashboard(element.textContent);
            }
        }
    });
});

// **********************************************************************//
// **********************************************************************//
// **********************************************************************//




// **********************************************************************//
// **********************************************************************//
// **********************************************************************//


// ************************* 2. Functions *******************************//
// **********************************************************************//


/** 
 * @param {string} filter
 */
function updateDashboard(filter) {

    let source = [];

    switch (filter) {
        case 'Daily':
            source = daily;
            break;
        case 'Weekly':
            source = weeekly;
            break;
        default:
            source = monthly;
            break;
    }

    source.forEach((element) => {
        const currentClassName = element.title.toLocaleLowerCase().replace(' ', '-');
        let period = '';

        currentHours = document.querySelector(`.${currentClassName} .current-hours`);
        previousHours = document.querySelector(`.${currentClassName} .previous-hours`);

        switch (filter) {
            case 'Daily':
                period = 'Day';
                break;
            case 'Weekly':
                period = 'Week';
                break;
            default:
                period = 'Month';
                break;
        }

        if (currentHours && previousHours) {
            currentHours.textContent = `${element.timeframes.current}hrs`;
            previousHours.textContent = `Last ${period} - ${element.timeframes.previous}hrs`;

            // https://css-tricks.com/restart-css-animation/
            currentHours.classList.remove('fade-animation'); // reset animation
            void currentHours.offsetWidth; // trigger reflow
            currentHours.classList.add('fade-animation'); // start animation

            previousHours.classList.remove('fade-animation');
            void previousHours.offsetWidth;
            previousHours.classList.add('fade-animation');
        }
    });
}

// **********************************************************************//
// **********************************************************************//
// **********************************************************************//
