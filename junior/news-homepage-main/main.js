// @ts-check

/**
 * @type {HTMLButtonElement|null}
 */
const toggle = document.querySelector('.mob-nav-toggle');

/**
 * @type {HTMLUListElement|null}
 */
const mobNav = document.querySelector('.mob-nav');

/**
 * @type {HTMLDivElement|null}
 */
const filter = document.querySelector('.filter');



toggle?.addEventListener('click', () => {
    const isOpen = mobNav?.getAttribute('data-visible');

    mobNav?.setAttribute('data-visible', isOpen == 'true' ? 'false' : 'true');
    toggle.setAttribute('data-visible', isOpen == 'true' ? 'false' : 'true');
    filter?.setAttribute('data-visible', isOpen == 'true' ? 'false' : 'true');
    toggle.setAttribute('aria-expanded', isOpen == 'true' ? 'false' : 'true');
});
