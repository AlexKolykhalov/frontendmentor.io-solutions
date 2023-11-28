// @ts-check

/**
* @type {NodeListOf<HTMLButtonElement>}
*/
const listFilters = document.querySelectorAll('.filter button');

/**
 * @type {HTMLButtonElement|null}
 */
const clearCompleted = document.querySelector('.clear-completed-btn');

/**
 * @type {HTMLInputElement|null}
 */
const input = document.querySelector('.new-todo-input>input');

/**
 * @typedef {object} TodoItem
 * @property {string} title
 * @property {boolean} completed
 */

/** 
 * Current Todo list.
 * @type {TodoItem[]}
 */
let todoList = [];

/**
 * X coordinate of dragging element when starting.
 * @type {number}
 */
let x0 = 0;

/**
 * Y coordinate of dragging element when starting.
 * @type {number}
 */
let y0 = 0;

/**
 * Provides the difference in the Y coordinate between current and previous positions.
 * @type {number}
 */
let movementY = 0;

/**
 * Value of the `scrollTop` of the Todo list when start dragging.
 * @type {number}
 */
let defaultScrollTop = 0;

/**
 * Cumulitave shift along the Y coordinate when changing elements beetween each other.
 * @type {number}
 */
let shiftY = 0;

// ************************** 1. Events *********************************//

window.addEventListener('load', () => {
    todoList = getTodoList();
    todoList.forEach(todo => {
        createTodo(todo);
    });
    changeInfoAboutActiveItems();
});

input?.addEventListener('focus', () => {
    // set `All` filter
    setFilter(0);
});

input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        /**
         * @type {TodoItem}
         */
        const newTodo = {
            title: input.value.trim(),
            completed: false,
        }
        createTodo(newTodo);
        todoList.push(newTodo);
        saveTodoList();
        changeInfoAboutActiveItems();
        input.value = '';
    }
});

clearCompleted?.addEventListener('click', () => {
    const allCompletedItems = document.querySelectorAll('input[type="checkbox"]:checked');
    if ([...allCompletedItems].length > 0) {
        allCompletedItems.forEach(elem => {
            elem.parentElement?.remove();
        });
        //select only active todoes
        todoList = todoList.filter((elem) => elem.completed === false);
        saveTodoList();
    }
});

listFilters.forEach(elem => {
    elem.addEventListener('click', () => {
        const index = [...listFilters].indexOf(elem);
        setFilter(index);
    });
});

// ************************* 2. Functions *******************************//

/**
 * Create a new todo. 
 * @param {TodoItem} todo 
 */
function createTodo(todo) {
    /**
     * @type {HTMLUListElement|null}
     */
    const todoListUL = document.querySelector('.todo-list');
    if (todoListUL) {
        const template = document.querySelector('template');
        if (template) {
            const templateContent = template.content.firstElementChild;
            if (templateContent) {
                /**@type {Node}*/
                const newTodoItemLI = templateContent.cloneNode(true);

                /**@type {HTMLLabelElement|null}*/
                //@ts-ignore
                const label = newTodoItemLI.querySelector('label');

                /**@type {HTMLInputElement|null}*/
                //@ts-ignore
                const input = newTodoItemLI.querySelector('input[type="checkbox"]');

                /**@type {HTMLParagraphElement|null}*/
                //@ts-ignore
                const p = newTodoItemLI.querySelector('p');

                /**@type {number}*/
                const id = todoList.indexOf(todo) === -1 ? todoList.length : todoList.indexOf(todo);

                if (label && input && p) {
                    label.setAttribute('for', `done-${id}`);
                    input.setAttribute('id', `done-${id}`);
                    input.checked = todo.completed;
                    p.textContent = todo.title;

                    input.addEventListener('click', () => {
                        const parentElement = input.parentElement;
                        const currentFilter = document.querySelector('.filter button[data-status]');

                        // set `todo item` visibility according current filter
                        if (currentFilter && parentElement) {
                            if (currentFilter.textContent === 'Active' && input.checked ||
                                currentFilter.textContent === 'Completed' && !input.checked) {
                                parentElement.setAttribute('data-visible', 'false');
                            }
                            const todoItemList = document.querySelectorAll('.todo-item');
                            const id = [...todoItemList].indexOf(parentElement);
                            todoList[id].completed = input.checked;
                            saveTodoList();
                            // remove focus for proper work of the visibility 
                            // of the delete button in todo-item 
                            input.blur();
                            changeInfoAboutActiveItems();
                        }
                    });
                    // drag & drop implementation
                    newTodoItemLI.addEventListener('touchstart', dragStart, { passive: true });
                    newTodoItemLI.addEventListener('mousedown', dragStart, { passive: true });
                    newTodoItemLI.addEventListener('dragstart', () => false, { passive: true });
                    todoListUL.appendChild(newTodoItemLI);
                }
            }
        }
    }
}

/**
 * Save current Todo list to `localStorage`.
 */
function saveTodoList() {
    localStorage.setItem('todo-list', JSON.stringify(todoList));
}

/**
 * Get Todo list from `localStorage`.
 * @returns {Array<TodoItem>}
 */
function getTodoList() {
    const data = localStorage.getItem('todo-list');
    return data ? JSON.parse(data) : [];
}

/**
 * Change info about the number of active items located at left bottom.  
 */
function changeInfoAboutActiveItems() {
    const allActiveItems = document.querySelectorAll('input[type="checkbox"]:not(:checked)');
    const output = document.querySelector('.items-left');
    const text = allActiveItems.length === 1 ? 'item left' : 'items left';
    if (output) {
        output.textContent = `${allActiveItems.length} ${text}`;
    }
}

/**
 * Set filter on the todo list
 * @param {number} index Number of filter (All = 0, Active = 1, Completed = 2)
 */
function setFilter(index) {
    if (listFilters[index].getAttribute('data-status') !== 'active') {
        listFilters.forEach(elem => {
            elem.removeAttribute('data-status');
        });
        listFilters[index].setAttribute('data-status', 'active');
        // `All` filter
        if (index === 0) {
            const allInvisible = document.querySelectorAll('.todo-item[data-visible="false"]');
            allInvisible.forEach(elem => {
                elem.removeAttribute('data-visible');
            });
        }
        // `Active` filter
        if (index === 1) {
            const active = document.querySelectorAll('input[type="checkbox"]:not(:checked)');
            active.forEach(elem => {
                elem.parentElement?.removeAttribute('data-visible');
            });
            const completed = document.querySelectorAll('input[type="checkbox"]:checked');
            completed.forEach(elem => {
                elem.parentElement?.setAttribute('data-visible', 'false');
            });
        }
        // `Completed` filter
        if (index === 2) {
            const active = document.querySelectorAll('input[type="checkbox"]:not(:checked)');
            active.forEach(elem => {
                elem.parentElement?.setAttribute('data-visible', 'false');
            });
            const completed = document.querySelectorAll('input[type="checkbox"]:checked');
            completed.forEach(elem => {
                elem.parentElement?.removeAttribute('data-visible');
            });
        }
    }
};

/**
 * @param {MouseEvent|TouchEvent} event 
 */
function dragStart(event) {
    // if click checkbox
    // @ts-ignore
    if (event.target.tagName.toLowerCase() === 'input') {
        return false;
    };
    if (event.currentTarget) {
        const todoListUL = document.querySelector('.todo-list');
        if (todoListUL) {
            // @ts-ignore
            const draggingElement = event.currentTarget;
            // @ts-ignore
            draggingElement.classList.add('dragging');

            // @ts-ignore
            // create `empty` element
            const emptyElement = draggingElement.cloneNode();
            emptyElement.classList.remove('dragging');
            emptyElement.classList.add('empty');

            // @ts-ignore
            // insert `empty` element after `dragging` element
            const nextSibling = draggingElement.nextSibling;
            todoListUL.insertBefore(emptyElement, nextSibling);

            if (event.type === 'touchstart') {
                // @ts-ignore
                x0 = event.touches[0].pageX;
                // @ts-ignore
                y0 = event.touches[0].pageY;
                todoListUL.setAttribute('style', 'overflow-y: hidden');
                document.addEventListener('touchmove', dragMove);
                document.addEventListener('touchend', dragEnd);
            }
            if (event.type === 'mousedown') {
                // @ts-ignore
                x0 = event.pageX;
                // @ts-ignore
                y0 = event.pageY;
                document.addEventListener('mousemove', dragMove);
                document.addEventListener('mouseup', dragEnd);
            }
            shiftY = 0;
            movementY = y0;
            defaultScrollTop = todoListUL.scrollTop;
            // @ts-ignore
            draggingElement.setAttribute('style', `--x: 0px; --y:-${defaultScrollTop}px`);
        }
    }
}

/**
 * @param {MouseEvent|TouchEvent} event 
 */
function dragMove(event) {
    const todoListUL = document.querySelector('.todo-list');
    const draggingElement = document.querySelector('.dragging');
    const emptyElement = document.querySelector('.empty');

    if (draggingElement && todoListUL && emptyElement) {
        const parentBox = todoListUL.getBoundingClientRect();
        const draggingBox = draggingElement.getBoundingClientRect();
        //@ts-ignore 
        const x1 = event.type === 'touchmove' ? event.touches[0].pageX : event.pageX;
        //@ts-ignore 
        const y1 = event.type === 'touchmove' ? event.touches[0].pageY : event.pageY;

        // smooth scrolling when crossing lines of detection 
        const topLineDetection = parentBox.top + parentBox.height * 0.23;
        const bottomLineDetection = parentBox.top + parentBox.height * 0.77;

        if (draggingBox.bottom > bottomLineDetection) {
            const delta = draggingBox.bottom - bottomLineDetection;
            todoListUL.scroll({ top: todoListUL.scrollTop + delta, behavior: "smooth" });
        }

        if (draggingBox.top < topLineDetection) {
            const delta = topLineDetection - draggingBox.top;
            todoListUL.scroll({ top: todoListUL.scrollTop - delta, behavior: "smooth" });
        }

        // to detect the direction
        movementY = y1 - movementY;

        // moving down
        if (movementY > 0) {
            const nextElement = emptyElement.nextElementSibling;
            if (nextElement) {
                const nextElementBox = nextElement.getBoundingClientRect();
                if (draggingBox.bottom > nextElementBox.top + nextElementBox.height / 2) {
                    const index = [...todoListUL.children].indexOf(draggingElement);
                    // swap two elements in array 
                    // https://stackoverflow.com/questions/872310/swap-array-elements-in-javascript
                    [todoList[index], todoList[index + 1]] = [todoList[index + 1], todoList[index]];

                    todoListUL.insertBefore(nextElement, draggingElement);
                    shiftY = shiftY - draggingBox.height;
                }
            }
        }

        // moving up
        if (movementY < 0) {
            const prevElement = draggingElement.previousElementSibling;
            if (prevElement) {
                const prevElementBox = prevElement.getBoundingClientRect();
                if (draggingBox.top < prevElementBox.top + prevElementBox.height / 2) {
                    const index = [...todoListUL.children].indexOf(draggingElement);
                    // swap two elements in array 
                    // https://stackoverflow.com/questions/872310/swap-array-elements-in-javascript
                    [todoList[index - 1], todoList[index]] = [todoList[index], todoList[index - 1]];

                    todoListUL.insertBefore(prevElement, emptyElement.nextElementSibling);
                    shiftY = shiftY + draggingBox.height;
                }
            }
        }

        movementY = y1;
        const x = x1 - x0;
        const y = y1 - y0 + shiftY - defaultScrollTop;
        draggingElement.setAttribute('style', `--x:${x}px; --y:${y}px`);
    }
}

/**
 * @param {MouseEvent|TouchEvent} event 
 */
function dragEnd(event) {
    const todoListUL = document.querySelector('.todo-list');
    todoListUL?.removeAttribute('style');

    const draggingElement = document.querySelector('.dragging');
    draggingElement?.classList.remove('dragging');
    draggingElement?.removeAttribute('style');

    const emptyElement = document.querySelector('.empty');
    emptyElement?.remove();

    if (event.type === 'touchend') {
        document.removeEventListener('touchmove', dragMove);
        document.removeEventListener('touchend', dragEnd);
    }
    if (event.type === 'mouseup') {
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
    }
    saveTodoList();
}