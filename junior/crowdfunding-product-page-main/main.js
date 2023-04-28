// @ts-check

/**
* @type {HTMLDialogElement | null}
*/
const backProjectDialog = document.querySelector('#back_project_dialog');

/**
* @type {HTMLDialogElement | null}
*/
const successDialog = document.querySelector('#success_dialog');

/**
* @type {HTMLButtonElement | null}
*/
const burgerBtn = document.querySelector('.burger-btn');

/**
* @type {HTMLButtonElement | null}
*/
const closeBtn = document.querySelector('.close-btn');

/**
* @type {HTMLButtonElement | null}
*/
const bookmarkBtn = document.querySelector('.bookmark-btn');

/**
* @type {HTMLParagraphElement | null}
*/
const bookmarkBtnTitle = document.querySelector('.bookmark-btn span');

/**
* "Back this project" button
* @type {HTMLButtonElement | null}
*/
const backProjectBtn = document.querySelector('.main-content section:nth-of-type(1) button:nth-of-type(1)');

/**
* @type {HTMLButtonElement | null}
*/
const successBtn = document.querySelector('#success_dialog button');

/**
* @type {HTMLUListElement | null}
*/
const headerNavList = document.querySelector('.header-nav-list');

/**
* @type {HTMLDivElement | null}
*/
const filter = document.querySelector('.filter');

/**
* @type {HTMLDivElement | null}
*/
const header = document.querySelector('.header');

/**
* @type {Number}
*/
let currentValue = 0;

/**
* @type {NodeListOf<HTMLDivElement> }
*/
let pledges;

// **********************************************************************//
// ************************** 1. Events *********************************//
// **********************************************************************//

window.addEventListener('resize', () => {
    bookmarkBtnTitle?.classList.add('sr-only');
    burgerBtn?.removeAttribute('data-visible');
    if (burgerBtn?.getAttribute('aria-expanded') === 'false') {
        headerNavList?.setAttribute('data-visible', 'false');
    }

    if (window.matchMedia("(min-width: 36em)").matches) {
        headerNavList?.removeAttribute('data-visible');
        burgerBtn?.setAttribute('data-visible', 'false');
        burgerBtn?.setAttribute('aria-expanded', 'false');
        filter?.setAttribute('data-visible', 'false');
        header?.setAttribute('data-status', 'z-index-0')
        bookmarkBtnTitle?.classList.remove('sr-only');
    }
});

window.addEventListener('load', async () => {
    if (window.matchMedia("(min-width: 36em)").matches) {
        burgerBtn?.setAttribute('data-visible', 'false');
        headerNavList?.removeAttribute('data-visible');
        bookmarkBtnTitle?.classList.remove('sr-only');
    }

    try {
        const response = await fetch('data.json');
        const data = await response.json();
        const template = document.querySelector('#radiogroup_type_pledges');
        data.forEach((element) => {
            if (template) {
                // @ts-ignore
                const clone = template.content.firstElementChild?.cloneNode(true);
                if (clone) {
                    if (element.reward > 0 && element.amount === 0) {
                        // @ts-ignore
                        clone.setAttribute('data-status', 'disable')
                        // @ts-ignore
                        const radioButton = clone.querySelector('input[type="radio"]');
                        if (radioButton) {
                            radioButton.disabled = true;
                        }
                    }

                    // @ts-ignore
                    const input = clone.querySelector('.pledge__title input');
                    if (input) {
                        input.setAttribute('id', 'pledge_title_' + element.reward.toString());
                    }

                    // @ts-ignore
                    const title = clone.querySelector('.pledge__title label');
                    if (title) {
                        title.textContent = element.title;
                        title.setAttribute('for', 'pledge_title_' + element.reward.toString());
                    }

                    // @ts-ignore
                    const subtitle = clone.querySelector('.pledge__title p');
                    if (subtitle) {
                        if (element.reward === 0) {
                            subtitle.remove();
                        }

                        if (element.reward > 0) {
                            subtitle.textContent = `Pledge $${element.reward} or more`;
                        }
                    }

                    // @ts-ignore
                    const p = clone.querySelector('.pledge__description');
                    if (p) {
                        p.textContent = element.text;
                    }

                    // @ts-ignore
                    const pledge__itemLeft = clone.querySelectorAll('.pledge__item-left');
                    if (pledge__itemLeft) {
                        pledge__itemLeft.forEach((item) => {
                            if (element.reward === 0) {
                                item.remove();
                            }
                            if (element.reward > 0) {
                                // @ts-ignore
                                const amount = item.querySelector('.pledge__item-left p');
                                if (amount) {
                                    amount.textContent = element.amount.toString();
                                }
                            }
                        });
                    }

                    // @ts-ignore
                    const pledge__input = clone.querySelector('.pledge__input');
                    if (pledge__input) {
                        // @ts-ignore
                        const inputPledge = clone.querySelector('.pledge__input input');
                        if (inputPledge) {
                            inputPledge.setAttribute('id', 'pledge_' + data.indexOf(element));
                            inputPledge.setAttribute('placeholder', element.reward.toString());
                            if (element.reward === 0) {
                                inputPledge.disabled = true;
                            }
                            inputPledge.addEventListener('focus', () => {
                                if (inputPledge.value === '') {
                                    inputPledge.value = element.reward.toString();
                                }
                            });
                            inputPledge.addEventListener('keydown', (e) => {
                                const str = getNewString(inputPledge, e.key);
                                subtitle.removeAttribute('data-status');
                                // don not type if NOT a digit
                                if (str.match(/\D/)) {
                                    e.preventDefault();
                                    return false;
                                }
                            });
                        }
                        // @ts-ignore
                        const labelPledge = clone.querySelector('.pledge__input label');
                        if (labelPledge) {
                            labelPledge.setAttribute('for', 'pledge_' + data.indexOf(element));
                        }
                    }

                    // @ts-ignore
                    const modalBackBtns = clone.querySelectorAll('button');
                    modalBackBtns.forEach((btn) => {
                        btn.addEventListener('click', () => {
                            // @ts-ignore
                            const inputPledge = clone.querySelector('.pledge__input input');
                            // @ts-ignore
                            const subtitle = clone.querySelector('.pledge__title p');
                            if (Number(inputPledge.value) < element.reward) {
                                subtitle.setAttribute('data-status', 'error');
                            } else {
                                if (successDialog) {
                                    currentValue = Number(inputPledge.value);
                                    const totalBacked = document.querySelector('.statistics>li:nth-of-type(1)>p:nth-of-type(1)');
                                    const totalBackers = document.querySelector('.statistics>li:nth-of-type(2)>p:nth-of-type(1)');
                                    const progressBar = document.querySelector('progress');
                                    totalBacked?.removeAttribute('data-status');
                                    totalBackers?.removeAttribute('data-status');
                                    progressBar?.removeAttribute('data-status');


                                    successDialog.showModal();
                                }
                            }
                        });
                    });

                    const fieldset = document.querySelector('fieldset');
                    fieldset?.appendChild(clone);

                }
            }
        });

        pledges = document.querySelectorAll('.pledge[data-status="unselected"]');
        pledges.forEach(pledge => {
            pledge.addEventListener('click', () => {
                if (pledge.getAttribute('data-status') === 'unselected') {
                    unselectAllPledges();
                    selectPledge(pledge);
                }
            });
        });
    } catch (error) {

    }
});

// ************************ 1.1 burgerBtn *******************************//
// **********************************************************************//

burgerBtn?.addEventListener('click', () => {
    burgerBtn.getAttribute('aria-expanded') === 'false' ?
        openHeaderNavList() :
        closeHeaderNavList();
});

// *********************** 1.2 backProjectBtn ***************************//
// **********************************************************************//

backProjectBtn?.addEventListener('click', () => {
    if (backProjectDialog) {
        unselectAllPledges();
        backProjectDialog.showModal();
    }
});

// ************************ 1.3 closeBtn ********************************//
// **********************************************************************//

closeBtn?.addEventListener('click', () => {
    if (backProjectDialog) {
        backProjectDialog.close()
    }
});

// ************************ 1.4 successBtn ********************************//
// **********************************************************************//

successBtn?.addEventListener('click', () => {
    if (successDialog) {
        successDialog.close();
    }
    if (backProjectDialog) {
        backProjectDialog.close();
    }
    // transaction simulation
    const totalBacked = document.querySelector('.statistics>li:nth-of-type(1)>p:nth-of-type(1)');
    const totalBackers = document.querySelector('.statistics>li:nth-of-type(2)>p:nth-of-type(1)');
    const progressBar = document.querySelector('progress');

    const val1 = Number(totalBacked?.textContent?.replace(',', '').replace('$', ''));
    const val2 = Number(totalBackers?.textContent?.replace(',', ''));

    if (totalBackers) {
        totalBackers.textContent = format((val2 + 1).toString());
        totalBackers.setAttribute('data-status', 'changed');
    }

    if (totalBacked && progressBar && currentValue > 0) {
        totalBacked.textContent = format((val1 + currentValue).toString());
        totalBacked.setAttribute('data-status', 'changed');
        progressBar.value = val1 + currentValue;
        progressBar.setAttribute('data-status', 'changed');
    }
});

// ************************ 1.5 bookmarkBtn ********************************//
// **********************************************************************//

bookmarkBtn?.addEventListener('click', () => {
    if (bookmarkBtn.hasAttribute('data-status')) {
        bookmarkBtn.removeAttribute('data-status');
        if (bookmarkBtnTitle) {
            bookmarkBtnTitle.textContent = 'Bookmark';
        }
    } else {
        bookmarkBtn.setAttribute('data-status', 'active');
        if (bookmarkBtnTitle) {
            bookmarkBtnTitle.textContent = 'Bookmarked';
        }
    }
});

// **********************************************************************//
// **********************************************************************//
// **********************************************************************//




// **********************************************************************//
// **********************************************************************//
// **********************************************************************//


// ************************* 2. Functions *******************************//
// **********************************************************************//

function openHeaderNavList() {
    burgerBtn?.setAttribute('aria-expanded', 'true');
    headerNavList?.setAttribute('data-visible', 'true');
    filter?.removeAttribute('data-visible');
    header?.setAttribute('data-status', 'z-index-1');
}

function closeHeaderNavList() {
    burgerBtn?.setAttribute('aria-expanded', 'false');
    headerNavList?.setAttribute('data-visible', 'false');
    filter?.setAttribute('data-visible', 'false');
    header?.setAttribute('data-status', 'z-index-0')
}

/**
 * @param {Element} element
 */
function selectPledge(element) {
    const radioButton = element.querySelector('input[type="radio"]');
    const pledgeInput = element.querySelector('.pledge__input');

    if (radioButton) {
        // @ts-ignore
        radioButton.checked = true;
    }
    element.setAttribute('data-status', 'selected');
    pledgeInput?.setAttribute('data-visible', 'true');
}

function unselectAllPledges() {
    pledges.forEach(element => {
        const radioButton = element.querySelector('input[type="radio"]');
        const pledgeValue = element.querySelector('input[type="text"]');
        const subtitle = element.querySelector('.pledge__title p');
        const pledgeInput = element.querySelector('.pledge__input');

        if (radioButton) {
            // @ts-ignore
            radioButton.checked = false;
        }

        if (pledgeValue) {
            // @ts-ignore
            pledgeValue.value = "";
        }

        element.setAttribute('data-status', 'unselected');
        pledgeInput?.setAttribute('data-visible', 'false');
        subtitle?.removeAttribute('data-status');
    });
}

/**
* Returns formating string like '1000'=>'1,000'
* @param {string} str
*/
function format(str) {
    return str.replace(/.(?=(...)+$)/g, '$&,');
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
        pasteSymbol === 'Tab' ||
        pasteSymbol === '' ||
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
