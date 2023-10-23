// @ts-check

/**
* @type {HTMLButtonElement|null}
*/
const headerNavBtn = document.querySelector('.header-nav-btn');

/**
* @type {HTMLUListElement|null}
*/
const headerNavList = document.querySelector('.header-nav-list');

/**
* @type {HTMLButtonElement|null}
*/
const headerCartIcon = document.querySelector('.header-cart-icon');

/**
* @type {HTMLElement|null}
*/
const cart = document.querySelector('.cart');

/**
* @type {HTMLDialogElement|null}
*/
const modDialog = document.querySelector('#modal_dialog');

/**
* @type {HTMLImageElement|null}
*/
const modCloseBtn = document.querySelector('#modal_dialog>div>button');

/**
* @type {HTMLImageElement|null}
*/
const carouselImage = document.querySelector('.carousel>img');

/**
* @type {NodeListOf<HTMLButtonElement>}
*/
const carouselThumbnailImgs = document.querySelectorAll('.carousel~ul button');

/**
* @type {NodeListOf<HTMLButtonElement>}
*/
const listCarouselPrevBtns = document.querySelectorAll('.carousel>button:first-of-type');

/**
* @type {NodeListOf<HTMLButtonElement>}
*/
const listCarouselNextBtns = document.querySelectorAll('.carousel>button:last-of-type');

/**
* @type {HTMLButtonElement|null}
*/
const minusBtn = document.querySelector('.counter>button:first-of-type');

/**
* @type {HTMLButtonElement|null}
*/
const plusBtn = document.querySelector('.counter>button:last-of-type');

/**
* @type {HTMLButtonElement|null}
*/
const addBtn = document.querySelector('.counter~.cta');

/**
* @type {HTMLButtonElement|null}
*/
const output = document.querySelector('.counter>output');

/**
* @type {number}
*/
let currentImgIndex = 0;

/**
* @type {number}
*/
let currentCountOfGoods = 0;

/**
* @type {number}
*/
let timeoutId = 0;

// ************************** 1. Events *********************************//

window.addEventListener('load', () => {
    headerNavBtn?.removeAttribute('data-visible');
    if (window.matchMedia("(min-width: 48em)").matches) {
        headerNavBtn?.setAttribute('data-visible', 'false');
        headerNavList?.removeAttribute('data-visible');
    }
});

window.addEventListener('resize', () => {
    closeCartItems();
    if (window.matchMedia("(min-width: 48em)").matches) {
        headerNavBtn?.setAttribute('data-visible', 'false');
        headerNavBtn?.setAttribute('aria-expanded', 'false');
        headerNavList?.removeAttribute('data-visible');
    } else {
        headerNavBtn?.removeAttribute('data-visible');
        closeMobileNavBar();
    }
});

headerNavBtn?.addEventListener('click', () => {
    if (headerNavList?.getAttribute('data-visible') === 'false') {
        openMobileNavBar();
    } else {
        closeMobileNavBar();
    }
});

headerCartIcon?.addEventListener('click', () => {
    if (cart?.getAttribute('data-visible') === 'false') {
        openCartItems();
    } else {
        closeCartItems();
    }
});

cart?.addEventListener('mouseenter', () => {
    cancelFadeOut();
});

cart?.addEventListener('mouseleave', () => {
    startFadeOut();
});

carouselImage?.addEventListener('click', () => {
    if (window.matchMedia("(min-width: 48em)").matches) {
        modDialog?.showModal();
    }
});

listCarouselPrevBtns.forEach(elem => {
    elem?.addEventListener('click', () => {
        currentImgIndex--;
        updateCarouselImgs();
    });
});

listCarouselNextBtns.forEach(elem => {
    elem?.addEventListener('click', () => {
        currentImgIndex++;
        updateCarouselImgs();
    });
});

carouselThumbnailImgs.forEach(elem => {
    elem?.addEventListener('click', () => {
        const index = [...carouselThumbnailImgs].indexOf(elem);
        currentImgIndex = index;
        updateCarouselImgs();
    });
});

minusBtn?.addEventListener('click', () => {
    currentCountOfGoods--;
    if (currentCountOfGoods < 1) {
        currentCountOfGoods = 0;
        addBtn?.setAttribute('disabled', '');
    }
    if (output) {
        output.textContent = currentCountOfGoods.toString();
    }
});

plusBtn?.addEventListener('click', () => {
    currentCountOfGoods++;
    addBtn?.removeAttribute('disabled');
    if (output) {
        output.textContent = currentCountOfGoods.toString();
    }
});

addBtn?.addEventListener('click', () => {
    updateGoodsInCart();
    currentCountOfGoods = 0;
    if (output) {
        output.textContent = currentCountOfGoods.toString();
    }
    addBtn?.setAttribute('disabled', '');
});

modCloseBtn?.addEventListener('click', () => {
    modDialog?.close();
});

// ************************* 2. Functions *******************************//



/**Starts the effect of smooth disappearance of the cart*/
function startFadeOut() {
    cart?.setAttribute('data-status', 'fadeout');
    timeoutId = setTimeout(closeCartItems, 3100);
}

/**Cancel the effect of smooth disappearance of the cart*/
function cancelFadeOut() {
    cart?.removeAttribute('data-status');
    clearTimeout(timeoutId);
}

function closeMobileNavBar() {
    headerNavList?.setAttribute('data-visible', 'false');
    headerNavBtn?.setAttribute('aria-expanded', 'false');

    const list = document.querySelectorAll('[tabindex="-1"]');
    list.forEach(elem => {
        elem.removeAttribute('tabindex');
        elem.removeAttribute('style');
    });
}

function openMobileNavBar() {
    headerNavList?.removeAttribute('data-visible');
    headerNavBtn?.setAttribute('aria-expanded', 'true');

    const list = document.querySelectorAll('a:not(.header-nav-list a), button:not(nav button)');
    list.forEach(elem => {
        elem.setAttribute('tabindex', '-1');
        elem.setAttribute('style', 'pointer-events: none');
    });
}

function openCartItems() {
    minusBtn?.setAttribute('disabled', '');
    plusBtn?.setAttribute('disabled', '');

    if (cart) {
        cart.removeAttribute('data-visible');
        headerCartIcon?.setAttribute('aria-expanded', 'true');
        if (cart.offsetLeft > 900) {
            cart.setAttribute('style', 'left: 900px');
        }

        /**
        * @type {HTMLButtonElement|null}
        */
        const cartDeleteBtn = document.querySelector('.cart-items-description button');

        /**
         * @type {HTMLDivElement|null}
         */
        const parentDiv = document.querySelector('.cart-items');

        cartDeleteBtn?.addEventListener('click', () => {
            const p = document.createElement('p');
            p.className = 'center-h fw-bold clr-n-700 pad-top-l';
            p.textContent = 'Your cart is empty';
            parentDiv?.replaceChildren(p);

            headerCartIcon?.removeAttribute('data-status');
            headerCartIcon?.removeAttribute('data-count');
        });
    }


    startFadeOut();
}

function closeCartItems() {
    cart?.setAttribute('data-visible', 'false');
    cart?.removeAttribute('style');
    cart?.removeAttribute('data-status');
    headerCartIcon?.setAttribute('aria-expanded', 'false');
    minusBtn?.removeAttribute('disabled');
    plusBtn?.removeAttribute('disabled');
    clearTimeout(timeoutId);
}

/**
 * Update main carousel img with dialog carousel img. 
 * Also update selected status thumbnails images.
 */
function updateCarouselImgs() {
    const value = Number(currentImgIndex.toString(4)) % 10;
    // negative number converts to positive
    const index = value < 0 ? value + 4 : value;

    carouselThumbnailImgs.forEach(elem => {
        elem.removeAttribute('data-status');
    });
    // set selected attr to main carousel
    carouselThumbnailImgs[index].setAttribute('data-status', 'selected');
    // set selected attr to dialog carousel
    carouselThumbnailImgs[index + 4].setAttribute('data-status', 'selected');

    /**@type {NodeListOf<HTMLImageElement>} */
    const listCarouselImages = document.querySelectorAll('.carousel>img');
    listCarouselImages.forEach(img => {
        img.setAttribute('src', `images/image-product-${index + 1}.jpg`);
    });
}

function updateGoodsInCart() {
    headerCartIcon?.setAttribute('data-status', 'added');
    headerCartIcon?.setAttribute('data-count', currentCountOfGoods.toString());

    /**
     * @type {HTMLTemplateElement|null}
     */
    const template = document.querySelector('#template');

    /**
     * @type {HTMLDivElement|null}
     */
    const parentDiv = document.querySelector('.cart-items');

    const clone = template?.content.cloneNode(true);
    if (clone && parentDiv) {
        const count = clone.querySelector('.cart-items-count');
        const price = clone.querySelector('.cart-items-price');
        count.textContent = currentCountOfGoods;
        price.textContent = `$${currentCountOfGoods * 125}.00`;
        parentDiv.replaceChildren(clone);
    }
}