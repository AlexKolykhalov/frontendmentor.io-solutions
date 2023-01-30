// @ts-check

const mq = window.matchMedia('(min-width:900px)');

const author = document.querySelector('.author');
const btn = document.querySelector('.share-button');
const composite = document.querySelector('.composite');
const links = document.querySelector('.social-links');

let isClicked = false;
let isLarge = mq.matches;

mq.addEventListener('change', (e) => {
    isLarge = false;
    if (e.matches) {
        isLarge = true;
        composite?.setAttribute('data-state', 'inactive');
    }
    setState();
});

btn?.addEventListener('click', () => {
    isClicked = !isClicked;
    setState();
});

function setState() {
    if (isClicked) {
        btn?.setAttribute('data-state', 'active');
        links?.setAttribute('data-state', 'visible');
        if (isLarge) {
            author?.setAttribute('data-state', 'visible');
        } else {
            author?.setAttribute('data-state', 'hidden');
            composite?.setAttribute('data-state', 'active');
        }
    } else {
        author?.setAttribute('data-state', 'visible');
        btn?.setAttribute('data-state', 'inactive');
        composite?.setAttribute('data-state', 'inactive');
        links?.setAttribute('data-state', 'hidden');
    }
}

