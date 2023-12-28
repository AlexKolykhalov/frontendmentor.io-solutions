// @ts-check

/**
 * @typedef Item
 * @property {string} id
 * @property {string} company
 * @property {string} logo
 * @property {string} new 
 * @property {string} featured 
 * @property {string} position 
 * @property {string} role 
 * @property {string} level 
 * @property {string} postedAt 
 * @property {string} contract 
 * @property {string} location 
 * @property {string[]} languages 
 * @property {string[]} tools 
 */

/**
 * @type {HTMLButtonElement|null}
 */
const clearBtn = document.querySelector('.filter button');

/**
 * @type {string[]}
 */
let filterWords = [];

// ************************** 1. Events *********************************//

window.addEventListener('load', async () => {
    try {
        const response = await fetch('data.json');
        /** @type {Item[]} */
        const data = await response.json();
        const template = document.querySelector('template');
        const parentDiv = document.querySelector('.jobs');

        if (template && parentDiv && data) {
            data.forEach((element) => {
                const clone = template.content.firstElementChild?.cloneNode(true);
                if (clone) {
                    // @ts-ignore
                    const article = clone.querySelector('article');
                    // @ts-ignore
                    const logo = clone.querySelector('.content>.row');
                    // @ts-ignore
                    const company = clone.querySelector('h4');
                    // @ts-ignore
                    const job = clone.querySelector('h4+a');
                    // @ts-ignore
                    const posted = clone.querySelector('.posted');
                    // @ts-ignore
                    const contract = clone.querySelector('.contract');
                    // @ts-ignore
                    const location = clone.querySelector('.location');
                    // @ts-ignore
                    const requirements = clone.querySelector('.requirements');
                    if (article && logo && company && job && posted && contract && location && requirements) {
                        logo.setAttribute('style', `--img: url(${element.logo})`);
                        company.textContent = element.company;
                        job.textContent = element.position;
                        posted.textContent = element.postedAt;
                        contract.textContent = element.contract;
                        location.textContent = element.location;

                        const role = createRequirement(element.role);
                        requirements.appendChild(role);

                        const level = createRequirement(element.level);
                        requirements.appendChild(level);

                        element.languages.forEach(element => {
                            const lang = createRequirement(element);
                            requirements.appendChild(lang);
                        });

                        element.tools.forEach(element => {
                            const tools = createRequirement(element);
                            requirements.appendChild(tools);
                        });
                    }

                    if (element.new) {
                        article.setAttribute('data-release', 'new');
                    }

                    if (element.featured) {
                        article.setAttribute('data-status', 'featured');
                    }

                    parentDiv.appendChild(clone);
                }
            });
        }
    } catch (error) {
    }
});

clearBtn?.addEventListener('click', () => {
    const filterBoard = document.querySelector('.filter');
    const filterList = document.querySelector('.filter ul');
    /**
     * Simple trigger to determine direction when appearing or hiding.
     * @type {boolean}
     */
    let direction = false;
    if (filterBoard && filterList) {
        [...filterList.childNodes].forEach((node) => {
            filterList.removeChild(node);
        });
        filterBoard.setAttribute('hidden', '');
        filterWords = [];
        const listJobs = document.querySelectorAll('.jobs>li[data-visible]');
        [...listJobs].forEach((job) => {
            direction = !direction;
            job.removeAttribute('data-visible');
            job.animate(
                [
                    {
                        opacity: 0,
                        transform: direction ? 'translateX(-100px)' : 'translateX(100px)',
                    },
                    {
                        opacity: 1,
                        transform: 'translateX(0px)',
                    }
                ],
                {
                    easing: 'ease-in',
                    duration: 200,
                }
            );
        })
    }
});

// ************************* 2. Functions *******************************//

/**
 * @param {string} name 
 */
function createRequirement(name) {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'pad-sm fw-bold clr-p-dark-cyan bg-n-100 border-radius';
    btn.textContent = name;
    btn.addEventListener('click', () => {
        if (filterWords.includes(name) === false) {
            addNewFilterWord(name);
        }
    });
    li.appendChild(btn);
    return li;
}

/**
 * @param {string} name 
 */
function addNewFilterWord(name) {
    const filterList = document.querySelector('.filter ul');
    if (filterList) {
        /**
         * Simple trigger to determine direction when appearing or hiding.
         * @type {boolean}
         */
        let direction = false;

        const listElement = document.createElement('li');
        listElement.className = 'fw-bold clr-p-dark-cyan bg-n-100 border-radius';
        const div = document.createElement('div');
        div.className = 'row no-wrap cross-axis-center';

        const span = document.createElement('span');
        span.className = 'pad-h-m';
        span.textContent = name;
        div.appendChild(span);

        const btn = document.createElement('button');
        btn.className = 'pad-sm bg-p-dark-cyan border-radius-right';
        const span1 = document.createElement('span');
        span1.className = 'sr-only';
        span1.textContent = 'Remove';
        btn.appendChild(span1);
        const img = document.createElement('img');
        img.src = 'images/icon-remove.svg';
        img.alt = '';
        btn.appendChild(img);
        btn.addEventListener('click', () => {
            filterList.removeChild(listElement);
            filterWords.splice(filterWords.indexOf(name), 1);
            if (filterWords.length === 0) {
                const filterBoard = document.querySelector('.filter');
                if (filterBoard) {
                    filterBoard.setAttribute('hidden', '');
                }
            }
            const listJobs = document.querySelectorAll('.jobs>li[data-visible]');
            [...listJobs].forEach(async (job) => {
                if (filterWords.length === 0) {
                    direction = !direction;
                    job.removeAttribute('data-visible');
                    job.animate(
                        [
                            {
                                opacity: 0,
                                transform: direction ? 'translateX(-100px)' : 'translateX(100px)',
                            },
                            {
                                opacity: 1,
                                transform: 'translateX(0px)',
                            }
                        ],
                        {
                            easing: 'ease-in',
                            duration: 200,
                        }
                    );
                } else {
                    const requirements = job.querySelectorAll('.requirements button');
                    const reqText = [...requirements].map((e) => e.textContent);
                    // if all filter words are in the requirements
                    if (filterWords.every((word) => reqText.includes(word)) === true) {
                        direction = !direction;
                        job.removeAttribute('data-visible');
                        job.animate(
                            [
                                {
                                    opacity: 0,
                                    transform: direction ? 'translateX(-100px)' : 'translateX(100px)',
                                },
                                {
                                    opacity: 1,
                                    transform: 'translateX(0px)',
                                }
                            ],
                            {
                                easing: 'ease-in',
                                duration: 200,
                            }
                        );
                    }
                }
            });
        });
        div.appendChild(btn);

        listElement.appendChild(div);
        filterList.appendChild(listElement);
        filterWords.push(name);
        const filterBoard = document.querySelector('.filter');
        if (filterBoard) {
            filterBoard.removeAttribute('hidden');
        }

        // remove not matched
        const listJobs = document.querySelectorAll('.jobs>li:not([data-visible])');
        [...listJobs].forEach(async (job) => {
            const requirements = job.querySelectorAll('.requirements button');
            const matched = [...requirements].filter((e) => e.textContent === name);
            if (matched.length === 0) {
                direction = !direction;
                const state = await job.animate(
                    [
                        {
                            opacity: 1,
                            transform: 'translateX(0px)',
                        },
                        {
                            opacity: 0,
                            transform: direction ? 'translateX(-100px)' : 'translateX(100px)',
                        }
                    ],
                    {
                        easing: 'ease-out',
                        duration: 200,
                    }
                ).finished;
                if (state.playState === 'finished') {
                    job.setAttribute('data-visible', 'false');
                }
            }
        });
    }
}