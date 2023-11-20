// @ts-check


/** DON'T FORGET <script src="main.js" defer></script> in HTML */
/**
* @type {NodeListOf<HTMLLIElement>}
*/
// const listDragElements = document.querySelectorAll('.todo-item');
const listDragElements = document.querySelectorAll('.todo-list>li');

// ************************** 1. Events *********************************//

// window.addEventListener('load', () => {
//     listDragElements.forEach(elem => {
//         elem.ondragstart = () => {
//             console.log('deny drag');
//             return false;
//         }
//     });
// });

listDragElements.forEach(elem => {

    elem.addEventListener('touchmove', (e) => {
        console.log('touch move');
    });

    elem.addEventListener('touchend', (e) => {
        console.log('touch end');
    });

    elem.addEventListener('touchstart', mouseDown);

    elem.addEventListener('mousedown', mouseDown);

    // elem.addEventListener('mouseup', mouseUp);

    elem.ondragstart = () => {
        return false;
    };

    elem.addEventListener('dragstart', (e) => {
        console.log('drag start');
    });

    elem.addEventListener('dragover', (e) => {
        e.preventDefault();
        console.log('drag over');
    });

    elem.addEventListener('dragend', () => {
        console.log('drag end');
    });
});

// ************************* 2. Functions *******************************//

let x = 0;
let y = 0;

/**
 * @param {MouseEvent|TouchEvent} event 
 */
function mouseDown(event) {
    console.log(`mouse down, target is: ${event.currentTarget}`);
    if (event.currentTarget) {
        const draggingElement = event.currentTarget;
        draggingElement.classList.add('dragging');
        if (event.type === 'touchstart') {
            x = event.touches[0].clientX
            y = event.touches[0].clientY
            document.addEventListener('touchmove', mouseMove);
            document.addEventListener('touchend', mouseUp);
        }
        if (event.type === 'mousedown') {
            x = event.clientX;
            y = event.clientY;
            document.addEventListener('mousemove', mouseMove);
            document.addEventListener('mouseup', mouseUp);
        }
        console.log(`startX: ${x}  startY: ${y}`);
    }
}

/**
 * @param {MouseEvent|TouchEvent} event 
 */
function mouseMove(event) {
    const draggingElement = document.querySelector('.todo-item.dragging');
    if (draggingElement) {
        let x1 = 0;
        let y1 = 0;
        if (event.type === 'touchmove') {
            console.log(`clientX: ${event.touches[0].clientX}, clientY: ${event.touches[0].clientY}`);
            x1 = event.touches[0].clientX - x;
            y1 = event.touches[0].clientY - y;
        }
        if (event.type === 'mousemove') {
            console.log(`clientX: ${event.clientX}, clientY: ${event.clientY}`);
            x1 = event.clientX - x;
            y1 = event.clientY - y;
        }
        draggingElement.setAttribute('style', `position:absolute; translate: ${x1}px ${y1}px;`);
        // draggingElement.setAttribute('style', `translate: ${c.x}px ${c.y}px`);
        console.log(`x1: ${x1}, y1: ${y1}`);
    }
}

/**
 * @param {MouseEvent|TouchEvent} event 
 */
function mouseUp(event) {
    const draggingElement = document.querySelector('.todo-item.dragging');
    if (draggingElement) {
        draggingElement.classList.remove('dragging');
        draggingElement.removeAttribute('style');
        if (event.type === 'touchend') {
            console.log('touch end');
            document.removeEventListener('touchmove', mouseMove);
            document.removeEventListener('touchend', mouseUp);
        }
        if (event.type === 'mouseup') {
            console.log('mouse up');
            document.removeEventListener('mousemove', mouseMove);
            document.removeEventListener('mouseup', mouseUp);
        }
    }
}