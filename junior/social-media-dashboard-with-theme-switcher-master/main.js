// @ts-check

/**
* @type {HTMLInputElement |null}
*/
const toggle = document.querySelector('.toggle > input[type="checkbox"]');

/**
* @type {HTMLBodyElement |null}
*/
const body = document.querySelector('body');

// ************************** 1. Events *********************************//

window.addEventListener('load', async () => {
    // check dark mode
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark").matches) {
        if (toggle) {
            toggle.checked = true;
        }
        body?.setAttribute('data-theme', 'dark');
    }

    try {
        const response = await fetch('data.json');
        const data = await response.json();
        const totals = document.querySelector('.totals');
        const template_totals = document.querySelector('#totals');
        const today = document.querySelector('.today');
        const template_today = document.querySelector('#today');

        data['total'].forEach(element => {
            if (template_totals) {
                // @ts-ignore
                const clone_totals = template_totals.content.firstElementChild?.cloneNode(true);
                if (clone_totals) {
                    if (element.name === 'facebook') {
                        clone_totals.classList.add('facebook');
                    } else if (element.name === 'twitter') {
                        clone_totals.classList.add('twitter');
                    } else if (element.name === 'instagram') {
                        clone_totals.classList.add('instagram');
                    } else {
                        clone_totals.classList.add('youtube');
                    }
                    // top
                    const logo = clone_totals.querySelector('.top > img');
                    const nickname = clone_totals.querySelector('.top > p');
                    logo.src = element.logo;
                    logo.alt = element.name;
                    nickname.textContent = element.nickname;
                    // middle
                    const subAmount = clone_totals.querySelector('.middle > p:first-child');
                    const subText = clone_totals.querySelector('.middle > p:last-child');
                    subAmount.textContent = element.total_sub > 9999 ? kFormatter(element.total_sub) : element.total_sub;
                    subText.textContent = element.name === 'youtube' ? 'subscribers' : 'followers';
                    // bottom
                    const img = clone_totals.querySelector('.bottom > img');
                    const subAmountToday = clone_totals.querySelector('.bottom > p');
                    img.src = element.today_sub > 0 ? 'images/icon-up.svg' : 'images/icon-down.svg';
                    img.alt = element.today_sub > 0 ? 'up' : 'down';
                    element.today_sub > 0 ?
                        subAmountToday.classList.add('clr-p-green') :
                        subAmountToday.classList.add('clr-p-red');
                    subAmountToday.textContent = `${Math.abs(element.today_sub)} Today`;
                }
                totals?.appendChild(clone_totals);
            }
        });

        data['today'].forEach(element => {
            if (template_today) {
                element.stat.forEach(stat => {
                    // @ts-ignore
                    const clone_today = template_today.content.firstElementChild?.cloneNode(true);
                    // top row
                    const rowName = clone_today.querySelector('.top-row > p');
                    const rowLogo = clone_today.querySelector('.top-row > img');
                    rowName.textContent = stat.name;
                    rowLogo.src = element.logo;
                    rowLogo.alt = element.name;
                    // bottom row
                    const todayViews = clone_today.querySelector('.bottom-row > p');
                    const todayViewsPercentImg = clone_today.querySelector('.bottom-row > .row > img');
                    const todayViewsPercentValue = clone_today.querySelector('.bottom-row > .row > p');
                    todayViews.textContent = stat.amount > 9999 ? kFormatter(stat.amount) : stat.amount;;
                    todayViewsPercentImg.src = stat.percent > 0 ? 'images/icon-up.svg' : 'images/icon-down.svg';
                    todayViewsPercentImg.alt = stat.percent > 0 ? 'up' : 'down';
                    stat.percent > 0 ?
                        todayViewsPercentValue.classList.add('clr-p-green') :
                        todayViewsPercentValue.classList.add('clr-p-red');
                    todayViewsPercentValue.textContent = `${Math.abs(stat.percent)} %`;
                    today?.appendChild(clone_today);
                });
            }
        });
    } catch (error) {
    }
});

toggle?.addEventListener('click', () => {
    if (toggle?.checked) {
        body?.setAttribute('data-theme', 'dark');
    } else {
        body?.setAttribute('data-theme', 'light');
    }
});

// ************************* 2. Functions *******************************//

/**
 * @param {number} num
 */
function kFormatter(num) {
    return Intl.NumberFormat('en', { notation: 'compact' }).format(num);
}

/**
 * @param {string} element
 */
function getColor(element) {
    let color;
    switch (element) {
        case 'facebook':
            color = 'var(--clr-facebook)';
            break;
        case 'twitter':
            color = 'var(--clr-twitter)';
            break;
        case 'instagram':
            color = 'var(--clr-youtube)';
            break;
        case 'youtube':
            color = 'var(--clr-youtube)';
            break;
    }
    return `border-top: 5px solid ${color};`;
}