// @ts-check

/**
 * @type {HTMLUListElement|null}
 */
const chart = document.querySelector('.chart');

// **********************************************************************//
// ***********************  Table of content  ***************************//
// **********************************************************************//
// 
// 1. Events
// 2. Functions


// **********************************************************************//
// ****************************  Events  ********************************//
// **********************************************************************//


window.addEventListener('load', () => {
    buildChart();
});


// **********************************************************************//
// *************************  Functions  ********************************//
// **********************************************************************//


async function buildChart() {
    const res = await fetch('data.json');
    const list = await res.json();

    const date = new Date(Date.now());
    const now = date.toDateString().substring(0, 3).toLowerCase();

    const sortList = Array.from(list).sort((a, b) => b.amount - a.amount);
    const maxAmount = sortList[0].amount;

    list.forEach((/** @type {{ amount: number; day: string; }} */ element) => {
        const li = document.createElement('li');

        const value = document.createElement('div');
        value.classList.add('value');
        value.textContent = `$${element.amount}`;


        const bar = document.createElement('div');
        bar.classList.add('bar');
        if (element.day === now) {
            bar.setAttribute('data-status', 'now');
        }

        const height = element.amount / maxAmount;

        bar.style.height = `${height * 100}px`;

        bar.addEventListener('mouseenter', () => {
            value.setAttribute('data-visible', 'true');
        });

        bar.addEventListener('mouseleave', () => {
            value.removeAttribute('data-visible');
        });

        li.appendChild(value);
        li.appendChild(bar);
        li.append(element.day);

        chart?.appendChild(li);
    });
}


// **********************************************************************//
// **********************************************************************//
// **********************************************************************//