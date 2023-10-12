// @ts-check

/**
* @type {HTMLDivElement|null}
*/
const carousel = document.querySelector('.carousel');

/**
* @type {HTMLButtonElement|null}
*/
const carouselController = document.querySelector('.carousel-controller');

/**
 * @type {number}
 */
let startX = 0;

/**
 * @type {number}
 */
let currentIndex = 0;

/**
 * available values "forward" and "backward"
 * @type {string|null}
 */
let turned = null;

/**
 * @type {object|null}
 */
let data = null;

/**@type {string} */
const pathname = '/frontendmentor.io-solutions/intermediate/space-tourism-website-main';
// const pathname = '/intermediate/space-tourism-website-main';

// ************************** 1. Events *********************************//

window.addEventListener('load', async () => {
    try {
        const response = await fetch('data.json');
        const json = await response.json();
        // console.log('carousel init');
        if (window.location.pathname === `${pathname}/crew.html`) {
            // console.log('current data is about crew');
            data = json.crew;
        }
        if (window.location.pathname === `${pathname}/destination.html`) {
            // console.log('current data is about destinations');
            data = json.destinations;
        }
        if (window.location.pathname === `${pathname}/technology.html`) {
            // console.log('current data is about technology');
            data = json.technology;
        }
    } catch (error) {
        console.log('data fetch error');
    }

    if (window.matchMedia("(min-width: 48em)").matches === false) {
        addBackwardForwardImagesToCarousel();
    }
});

window.addEventListener('resize', () => {
    if (window.matchMedia("(min-width: 48em)").matches) {
        removeBackwardForwardImagesFromCarousel();
    } else {
        if (data) {
            addBackwardForwardImagesToCarousel()
        }
    }
});

carousel?.addEventListener('touchmove', (e) => {
    const headerNavBtn = document.querySelector('.header-nav-btn');
    // works only if sidebar closed
    if (headerNavBtn?.getAttribute('aria-expanded') === 'false') {
        const img = document.querySelector('.carousel .front');
        const imgForward = document.querySelector('.carousel .forward');
        const imgBackward = document.querySelector('.carousel .backward');
        if (img && imgForward && imgBackward) {
            const currentX = e.touches[0].clientX;

            const half = carousel?.offsetWidth / 2;

            const offset = half - (startX - currentX);
            const absOffset = half - Math.abs(startX - currentX);

            const scale = range(0, 1, 0.5, 1, absOffset / half);
            const opacity = range(0, 0.5, 0, 1, absOffset / half);
            const translate = range(0, 2, -100, 100, offset / half);

            imgBackward.setAttribute("style", `--scale: ${1 - scale + 0.5}; --translateX: ${-100 + translate}%; --opacity: ${1 - opacity};`);
            img.setAttribute("style", `--scale: ${scale}; --translateX: ${translate}%; --opacity: ${opacity};`);
            imgForward.setAttribute("style", `--scale: ${1 - scale + 0.5}; --translateX: ${100 + translate}%; --opacity: ${1 - opacity};`);

            if (translate < -90) {
                turned = 'forward';
            }

            if (translate > 90) {
                turned = 'backward';
            }
        }
    }
}, { passive: true });

carousel?.addEventListener('touchstart', (e) => {
    turned = null;
    startX = e.touches[0].clientX;

    carouselController?.dispatchEvent(new CustomEvent('break'));
}, { passive: true });

carousel?.addEventListener('touchend', (e) => {
    if (turned !== null) {
        const index = turned === 'forward' ?
            currentIndex + 1 :
            currentIndex - 1;
        setCurrentCarouselIndex(index)
        updateCarouselImages();

        carousel.dispatchEvent(new CustomEvent('turned', { detail: currentIndex }));
    }
}, { passive: true });

carouselController?.addEventListener('click', () => {
    const description = carouselController.querySelector('span.sr-only');
    const imgSvg = carouselController.querySelector('img');
    const spinner = carouselController.querySelector('.spinner');
    if (description && imgSvg && spinner) {
        if (description.textContent === 'Pause') {
            imgSvg.src = 'images/play.svg';
            description.textContent = 'Play';
            spinner.removeAttribute('data-status');

            // dispatch event our listeners in destination.js, crew.js and technology.js
            carouselController.dispatchEvent(new CustomEvent('pause'));
        } else {
            imgSvg.src = 'images/pause.svg';
            description.textContent = 'Pause';
            spinner.setAttribute('data-status', 'on');

            carouselController.dispatchEvent(new CustomEvent('play', { detail: currentIndex }));
        }
    }
});

carouselController?.addEventListener('break', () => {
    const description = carouselController.querySelector('span.sr-only');
    const imgSvg = carouselController.querySelector('img');
    const spinner = carouselController.querySelector('.spinner');
    if (description && imgSvg && spinner) {
        imgSvg.src = 'images/play.svg';
        description.textContent = 'Play';
        spinner.removeAttribute('data-status');

        carouselController.dispatchEvent(new CustomEvent('pause'));
    }
});

// ************************* 2. Functions *******************************//

function removeBackwardForwardImagesFromCarousel() {
    const carousel = document.querySelector('.carousel');
    const front = document.querySelector('.carousel .front');
    const backward = document.querySelector('.carousel .backward');
    const forward = document.querySelector('.carousel .forward');
    if (carousel && backward && front && forward) {
        carousel.removeChild(backward);
        front.removeAttribute('style');
        front.classList.remove('front');
        carousel.removeChild(forward);
    }
}

function addBackwardForwardImagesToCarousel() {
    let srcsetBackward = '';
    let srcsetForward = '';
    let srcBackward = '';
    let srcForward = '';
    let altBackward = '';
    let altForward = '';

    const indexBackward = convertTo(currentIndex - 1, data.length);
    const indexForward = convertTo(currentIndex + 1, data.length);

    if (window.location.pathname === `${pathname}/destination.html`) {
        srcBackward = data[indexBackward].images.webp;
        altBackward = data[indexBackward].name;

        srcForward = data[indexForward].images.webp;;
        altForward = data[indexForward].name;
    }

    if (window.location.pathname === `${pathname}/crew.html`) {
        srcBackward = data[indexBackward].images.webp;
        altBackward = data[indexBackward].role;

        srcForward = data[indexForward].images.webp;;
        altForward = data[indexForward].role;
    }

    if (window.location.pathname === `${pathname}/technology.html`) {
        srcsetBackward = data[indexBackward].images.portrait;
        srcBackward = data[indexBackward].images.landscape;
        altBackward = data[indexBackward].name;

        srcsetForward = data[indexForward].images.portrait;
        srcForward = data[indexForward].images.landscape;;
        altForward = data[indexForward].name;
    }

    const carousel = document.querySelector('.carousel');
    const imgBackward = document.querySelector('.carousel .backward');
    const imgForward = document.querySelector('.carousel .forward');
    if (carousel !== null && imgBackward === null && imgForward === null) {
        if (window.location.pathname === `${pathname}/destination.html` ||
            window.location.pathname === `${pathname}/crew.html`) {

            const img = carousel.querySelector('img');
            if (img) {
                // find class name of the front image
                const imgClassName = img.getAttribute('class') === null ? '' : img.getAttribute('class');
                img.classList.add('front');

                const newImgBackward = document.createElement('img');
                newImgBackward.className = `${imgClassName} backward`;
                newImgBackward.src = srcBackward;
                newImgBackward.alt = altBackward;
                carousel?.appendChild(newImgBackward);

                const newImgForward = document.createElement('img');
                newImgForward.className = `${imgClassName} forward`;
                newImgForward.src = srcForward;
                newImgForward.alt = altForward;
                carousel?.appendChild(newImgForward);
            }
        }

        if (window.location.pathname === `${pathname}/technology.html`) {
            const pic = carousel.querySelector('picture');
            if (pic) {
                // find class name of the front image
                const picClassName = pic.getAttribute('class') === null ? '' : pic.getAttribute('class');
                pic.classList.add('front');

                const newPicBackward = pic.cloneNode(true);
                newPicBackward.className = `${picClassName} backward`;
                const newSourceBackward = newPicBackward.querySelector('source');
                newSourceBackward.srcset = srcsetBackward;
                const newImgBackward = newPicBackward.querySelector('img');
                newImgBackward.src = srcBackward;
                newImgBackward.alt = altBackward;
                carousel?.appendChild(newPicBackward);

                const newPicForward = pic.cloneNode(true);
                newPicForward.className = `${picClassName} forward`;
                const newSourceForward = newPicForward.querySelector('source');
                newSourceForward.srcset = srcsetForward;
                const newImgForward = newPicForward.querySelector('img');
                newImgForward.src = srcForward;
                newImgForward.alt = altForward;
                carousel?.appendChild(newPicForward);
            }
        }
    }
}

/**
 * Jump to image by index with animation effect
 * @param {number} imageIndex 
 * @param {number} duration 
 */
function animateCarouselImages(imageIndex, duration) {
    const index = convertTo(imageIndex, data.length);
    if (index !== currentIndex) {
        const imgFront = document.querySelector('.carousel .front');
        let imgHidden;

        if (window.location.pathname === `${pathname}/destination.html`) {
            imgHidden = index < currentIndex ?
                document.querySelector('.carousel .backward') :
                document.querySelector('.carousel .forward');
            if (imgHidden) {
                imgHidden.src = data[index].images.webp;
                imgHidden.alt = data[index].name;
            }
        }

        if (window.location.pathname === `${pathname}/crew.html`) {
            imgHidden = index < currentIndex ?
                document.querySelector('.carousel .backward') :
                document.querySelector('.carousel .forward');
            if (imgHidden) {
                imgHidden.src = data[index].images.webp;
                imgHidden.alt = data[index].role;
            }
        }

        if (window.location.pathname === `${pathname}/technology.html`) {
            imgHidden = index < currentIndex ?
                document.querySelector('.carousel .backward') :
                document.querySelector('.carousel .forward');
            if (imgHidden) {
                const source = imgHidden.querySelector('source');
                const img = imgHidden.querySelector('img');
                if (source && img) {
                    source.srcset = data[index].images.portrait;;
                    img.src = data[index].images.webp;
                    img.alt = data[index].name;
                }
            }
        }

        let start = performance.now();

        const id = requestAnimationFrame(function animate(time) {
            // timeFraction changed form 0 to 1
            let timeFraction = (time - start) / duration;
            if (timeFraction > 1) {
                timeFraction = 1;
            }

            const progress = 1 - Math.pow(timeFraction, 6);

            const scale = range(0, 1, 0.5, 1, progress);
            const opacity = range(0, 0.5, 0, 1, progress);
            const translate = range(0, 1, index < currentIndex ? 100 : -100, 0, progress);

            if (imgFront && imgHidden) {
                imgFront.setAttribute("style", `--scale: ${scale}; --translateX: ${translate}%; --opacity: ${opacity};`);
                imgHidden.setAttribute("style", `--scale: ${1 - scale + 0.5}; --translateX: ${(index < currentIndex ? -100 : 100) + translate}%; --opacity: ${1 - opacity};`);
            }

            if (timeFraction < 1) {
                requestAnimationFrame(animate);
            } else {
                cancelAnimationFrame(id);
                setCurrentCarouselIndex(index);
                updateCarouselImages();

                // dispatch currentIndex our listeners in destination.js, crew.js and technology.js
                carousel?.dispatchEvent(new CustomEvent('turned', { detail: index }));
            }
        });
    }
}

function updateCarouselImages() {
    /**
     * @type {HTMLImageElement|null}
     */
    const front = document.querySelector('.carousel .front');

    /**
     * @type {HTMLImageElement|null}
     */
    const backward = document.querySelector('.carousel .backward');

    /**
     * @type {HTMLImageElement|null}
     */
    const forward = document.querySelector('.carousel .forward');

    if (front && backward && forward) {
        const frontIndex = currentIndex;
        const backwardIndex = convertTo(frontIndex - 1, data.length);
        const forwardIndex = convertTo(frontIndex + 1, data.length);

        if (window.location.pathname === `${pathname}/crew.html`) {
            front.src = data[frontIndex].images.webp;
            front.alt = data[frontIndex].role;

            backward.src = data[backwardIndex].images.webp;
            backward.alt = data[backwardIndex].role;

            forward.src = data[forwardIndex].images.webp;;
            forward.alt = data[forwardIndex].role;
        }

        if (window.location.pathname === `${pathname}/destination.html`) {
            front.src = data[frontIndex].images.webp;
            front.alt = data[frontIndex].name;

            backward.src = data[backwardIndex].images.webp;
            backward.alt = data[backwardIndex].name;

            forward.src = data[forwardIndex].images.webp;;
            forward.alt = data[forwardIndex].name;
        }

        if (window.location.pathname === `${pathname}/technology.html`) {
            const frontSource = front.querySelector('source');
            if (frontSource) {
                frontSource.srcset = data[frontIndex].images.portrait;
            }
            const frontImg = front.querySelector('img');
            if (frontImg) {
                frontImg.src = data[frontIndex].images.landscape;
                frontImg.alt = data[frontIndex].name;
            }

            const backwardSource = backward.querySelector('source');
            if (backwardSource) {
                backwardSource.srcset = data[backwardIndex].images.portrait;
            }
            const backwardImg = backward.querySelector('img');
            if (backwardImg) {
                backwardImg.src = data[backwardIndex].images.landscape;
                backwardImg.alt = data[backwardIndex].name;
            }

            const forwardSource = forward.querySelector('source');
            if (forwardSource) {
                forwardSource.srcset = data[forwardIndex].images.portrait;
            }
            const forwardImg = forward.querySelector('img');
            if (forwardImg) {
                forwardImg.src = data[forwardIndex].images.landscape;
                forwardImg.alt = data[forwardIndex].name;
            }
        }

        backward.setAttribute("style", "--scale: 1; --translateX: -100%; --opacity: 1;");
        front.setAttribute("style", "--scale: 1; --translateX: 0%; --opacity: 1;");
        forward.setAttribute("style", "--scale: 1; --translateX: 100%; --opacity: 1;");
    }
}

/**
 * Provides data depending on the `window.location.pathname` by index,
 * e.c. if you on Crew page you get crew data from data.json file by specific index. 
 * @param {number} index
 * @returns {object} object
 */
function getDataByIndex(index) {
    return data[index];
}

/**
 * @param {number} index
 */
function setCurrentCarouselIndex(index) {
    currentIndex = convertTo(index, data.length);
    // console.log(`now current index is ${currentIndex}`);
}

/**
 * Convert `num` to `range` numeric system
 */
function convertTo(/** @type {number} */ num, /** @type {number} */ range) {
    const value = Number(num.toString(range)) % 10;

    // negative number converts to positive
    return value < 0 ? value + range : value;
}

const lerp = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ a) => x * (1 - a) + y * a;

const clamp = (/** @type {number} */ a, min = 0, max = 1) => Math.min(max, Math.max(min, a));

const invlerp = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ a) => clamp((a - x) / (y - x));

const range = (/** @type {number} */ x1, /** @type {number} */ y1, /** @type {number} */ x2, /** @type {number} */ y2, /** @type {number} */ a) => lerp(x2, y2, invlerp(x1, y1, a));

export { getDataByIndex, animateCarouselImages } 