// @ts-check


/** DON'T FORGET <script src="main.js" defer></script> in HTML */
/**
* @type {NodeListOf<HTMLLIElement>}
*/
// const listDragElements = document.querySelectorAll('.todo-item');
const listDragElements = document.querySelectorAll('.todo-list>li');

// ************************** 1. Events *********************************//

listDragElements.forEach(elem => {
    elem.addEventListener('dragstart', (e) => {
        // elem.setAttribute('style', 'opacity: 0.4');
        // e.preventDefault();
        console.log('start');
    });

    elem.addEventListener('dragover', (e) => {
        // elem.removeAttribute('style');

        e.preventDefault();
        console.log('over');
    });

    elem.addEventListener('dragend', () => {
        // elem.removeAttribute('style');
        console.log('end');
    });
});



// ************************* 2. Functions *******************************//