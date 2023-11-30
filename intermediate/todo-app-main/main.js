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
 * @type {HTMLInputElement|null}
 */
const colorThemeToggleBtn = document.querySelector('.toggle-color-scheme');

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

let timeoutID = 0;

// ************************** 1. Events *********************************//

window.addEventListener('load', () => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches === true) {
        setTheme('dark');
    } else {
        setTheme('light');
    }
    const todoListUL = document.querySelector('.todo-list');
    if (todoListUL) {
        todoList = getTodoList();
        todoList.forEach((todo) => {
            const newTodo = createNewTodo(todo);
            if (newTodo) {
                todoListUL.appendChild(newTodo);
            }
        });
        changeInfoAboutActiveItems();
    }
});

colorThemeToggleBtn?.addEventListener('click', () => {
    const body = document.querySelector('body');
    if (body) {
        if (body.getAttribute('data-theme') === 'dark') {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    }
});

input?.addEventListener('focus', () => {
    // set `All` filter
    setFilter(0);
});

input?.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        /**
         * @type {TodoItem}
         */
        const newTodo = {
            title: input.value.trim(),
            completed: false,
        }
        const newTodoElement = createNewTodo(newTodo);
        if (newTodoElement) {
            const todoListUL = document.querySelector('.todo-list');
            if (todoListUL) {
                todoListUL.appendChild(newTodoElement);
                //@ts-ignore
                newTodoElement.setAttribute('style', 'opacity: 0');
                //@ts-ignore
                const state = await newTodoElement.animate(
                    [{ opacity: 1 }],
                    {
                        easing: 'ease-in',
                        duration: 300,
                    }
                ).finished;
                if (state.playState === 'finished') {
                    //@ts-ignore
                    newTodoElement.removeAttribute('style');
                }
                todoList.push(newTodo);
                saveTodoList();
                changeInfoAboutActiveItems();
                input.value = '';
            }
        }
    }
});

clearCompleted?.addEventListener('click', () => {
    const allCompletedItems = document.querySelectorAll('input[type="checkbox"]:checked');
    if ([...allCompletedItems].length > 0) {
        allCompletedItems.forEach(async (elem) => {
            const state = await elem.animate(
                [{ opacity: 0 }],
                {
                    easing: 'ease-out',
                    duration: 300,
                }
            ).finished;
            if (state.playState === 'finished') {
                elem.parentElement?.remove();
            }
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
 * Create a new todo. 
 * @param {TodoItem} todo 
 * @return {Node|undefined} New HTML element.
 */
function createNewTodo(todo) {
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

                /**@type {HTMLButtonElement|null}*/
                //@ts-ignore
                const btn = newTodoItemLI.querySelector('button');

                /**@type {HTMLParagraphElement|null}*/
                //@ts-ignore
                const p = newTodoItemLI.querySelector('p');

                /**@type {number}*/
                const id = todoList.indexOf(todo) === -1 ? todoList.length : todoList.indexOf(todo);

                if (label && input && btn && p) {
                    label.setAttribute('for', `done-${id}`);
                    input.setAttribute('id', `done-${id}`);
                    input.checked = todo.completed;
                    p.textContent = todo.title;
                    input.addEventListener('click', async () => {
                        const parentElement = input.parentElement;
                        const currentFilter = document.querySelector('.filter button[data-status]');

                        // set `todo item` visibility according current filter
                        if (currentFilter && parentElement) {
                            if (currentFilter.textContent === 'Active' && input.checked ||
                                currentFilter.textContent === 'Completed' && !input.checked) {
                                const state = await parentElement.animate(
                                    [{ opacity: 0 }],
                                    {
                                        easing: 'ease-out',
                                        duration: 300,
                                    }
                                ).finished;
                                if (state.playState === 'finished') {
                                    parentElement.setAttribute('data-visible', 'false');
                                }
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
                    btn.addEventListener('click', async () => {
                        const parentElement = btn.parentElement;
                        if (parentElement) {
                            const state = await parentElement.animate(
                                [{ opacity: 0 }],
                                {
                                    easing: 'ease-out',
                                    duration: 300,
                                }
                            ).finished;
                            if (state.playState === 'finished') {
                                const todoItemList = document.querySelectorAll('.todo-item');
                                const id = [...todoItemList].indexOf(parentElement);
                                todoList.splice(id, 1);
                                parentElement.remove();
                                changeInfoAboutActiveItems();
                                saveTodoList();
                            }
                        }
                    });
                    // drag & drop implementation
                    newTodoItemLI.addEventListener('touchstart', dragStart, { passive: true });
                    newTodoItemLI.addEventListener('mousedown', dragStart, { passive: true });
                    return newTodoItemLI;
                }
            }
        }
    }
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
 * @param {string} theme Available values: 'light' and 'dark'
 */
function setTheme(theme) {
    if (colorThemeToggleBtn) {
        const body = document.querySelector('body');
        const img = colorThemeToggleBtn.querySelector('img');
        if (body && img) {
            if (theme == 'dark') {
                img.src = 'images/icon-sun.svg';
                body.setAttribute('data-theme', 'dark');
            } else {
                img.src = 'images/icon-moon.svg';
                body.setAttribute('data-theme', 'light');
            }
        }
    }
}

/**
 * Set filter on the todo list
 * @param {number} index Number of filter (All = 0, Active = 1, Completed = 2)
 */
function setFilter(index) {
    listFilters.forEach(elem => {
        index === [...listFilters].indexOf(elem)
            ? listFilters[index].setAttribute('data-status', 'active')
            : elem.removeAttribute('data-status');
    });

    // `All` filter
    if (index === 0) {
        const allInvisible = document.querySelectorAll('.todo-item[data-visible="false"]');
        allInvisible.forEach(async (elem) => {
            elem.removeAttribute('data-visible');
            elem.setAttribute('style', 'opacity: 0');
            const state = await elem.animate(
                [{ opacity: 1 }],
                {
                    easing: 'ease-in',
                    duration: 300,
                }
            ).finished;
            if (state.playState === 'finished') {
                elem.removeAttribute('style');
            }
        });
    } else {
        /**
         * @type {NodeListOf<HTMLInputElement>}
         */
        const inputsList = document.querySelectorAll('input[type="checkbox"]');
        inputsList.forEach(async (input) => {
            if (input.parentElement) {
                // `Active` filter
                if (index === 1) {
                    input.checked ?
                        input.parentElement.setAttribute('data-visible', 'false') :
                        input.parentElement.removeAttribute('data-visible');
                }
                // `Completed` filter
                if (index === 2) {
                    input.checked ?
                        input.parentElement.removeAttribute('data-visible') :
                        input.parentElement.setAttribute('data-visible', 'false');
                }
                input.parentElement.setAttribute('style', 'opacity: 0');
                const state = await input.parentElement.animate(
                    [{ opacity: 1 }],
                    {
                        easing: 'ease-in',
                        duration: 300,
                    }
                ).finished;
                if (state.playState === 'finished') {
                    input.parentElement.removeAttribute('style');
                }
            }
        });
    }
};

/**
 * Create dragging and empty elements. 
 * @param {EventTarget|null} target 
 */
function createDraggingElement(target) {
    const todoListUL = document.querySelector('.todo-list');
    if (todoListUL) {
        // @ts-ignore
        const draggingElement = target;
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

        // @ts-ignore
        draggingElement.setAttribute('style', `--x: 0px; --y:-${defaultScrollTop}px`);
    }
}

/**
 * @param {Event} event 
 */
function dragStart(event) {
    const target = event.target;
    if (target) {
        // if click checkbox or button or img inside button
        // @ts-ignore
        const tagName = target.tagName.toLowerCase();
        if (tagName === 'input' || tagName === 'button' || tagName == 'img') {
            return false;
        };
        const html = document.querySelector('html');
        const body = document.querySelector('body');
        const todoListUL = document.querySelector('.todo-list');
        if (html && body && todoListUL) {
            // set defaults
            shiftY = 0;
            movementY = y0;
            defaultScrollTop = todoListUL.scrollTop;
            // hide horizontal & vertical scroll bars
            html.setAttribute('style', 'overflow: hidden');
            body.setAttribute('style', 'overscroll-behavior: contain; overflow: hidden;');
            if (event.type === 'touchstart') {
                // implementing long press
                timeoutID = setTimeout(() => {
                    // @ts-ignore
                    x0 = event.touches[0].pageX;
                    // @ts-ignore
                    y0 = event.touches[0].pageY;
                    todoListUL.setAttribute('style', 'overflow-y: hidden');
                    createDraggingElement(target);
                    document.addEventListener('touchmove', dragMove);
                }, 800);
                document.addEventListener('touchend', dragEnd);
            }
            if (event.type === 'mousedown') {
                // @ts-ignore
                x0 = event.pageX;
                // @ts-ignore
                y0 = event.pageY;
                createDraggingElement(target);
                document.addEventListener('mousemove', dragMove);
                document.addEventListener('mouseup', dragEnd);
            }
        }
    }
}

/**
 * @param {Event} event 
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
        // to detect the direction
        movementY = y1 - movementY;
        // moving down
        if (movementY > 0) {
            const nextElement = emptyElement.nextElementSibling;
            if (nextElement) {
                // smooth scrolling when crossing lines of detection (only desktop view)
                const bottomLineDetection = parentBox.top + parentBox.height * 0.77;
                if (draggingBox.bottom > bottomLineDetection) {
                    const delta = draggingBox.bottom - bottomLineDetection;
                    todoListUL.scroll({ top: todoListUL.scrollTop + delta, behavior: "smooth" });
                }
                const nextElementBox = nextElement.getBoundingClientRect();
                if (draggingBox.bottom > nextElementBox.top + nextElementBox.height / 2) {
                    const index = [...todoListUL.children].indexOf(draggingElement);
                    // swap two elements in array 
                    // https://stackoverflow.com/questions/872310/swap-array-elements-in-javascript
                    [todoList[index], todoList[index + 1]] = [todoList[index + 1], todoList[index]];
                    // changed elements in DOM
                    todoListUL.insertBefore(nextElement, draggingElement);
                    shiftY = shiftY - draggingBox.height;
                }
            }
        }
        // moving up
        if (movementY < 0) {
            const prevElement = draggingElement.previousElementSibling;
            if (prevElement) {
                // smooth scrolling when crossing lines of detection (only desktop view)
                const topLineDetection = parentBox.top + parentBox.height * 0.23;
                if (draggingBox.top < topLineDetection) {
                    const delta = topLineDetection - draggingBox.top;
                    todoListUL.scroll({ top: todoListUL.scrollTop - delta, behavior: "smooth" });
                }
                const prevElementBox = prevElement.getBoundingClientRect();
                if (draggingBox.top < prevElementBox.top + prevElementBox.height / 2) {
                    const index = [...todoListUL.children].indexOf(draggingElement);
                    // swap two elements in array 
                    // https://stackoverflow.com/questions/872310/swap-array-elements-in-javascript
                    [todoList[index - 1], todoList[index]] = [todoList[index], todoList[index - 1]];
                    // changed elements in DOM
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
 * @param {Event} event 
 */
function dragEnd(event) {
    const html = document.querySelector('html');
    const body = document.querySelector('body');
    const todoListUL = document.querySelector('.todo-list');
    html?.removeAttribute('style');
    body?.removeAttribute('style');
    todoListUL?.removeAttribute('style');

    const draggingElement = document.querySelector('.dragging');
    draggingElement?.classList.remove('dragging');
    draggingElement?.removeAttribute('style');

    const emptyElement = document.querySelector('.empty');
    emptyElement?.remove();

    if (event.type === 'touchend') {
        document.removeEventListener('touchmove', dragMove);
        document.removeEventListener('touchend', dragEnd);
        clearTimeout(timeoutID);
        console.log(`clear timeout: ${timeoutID}`);
    }
    if (event.type === 'mouseup') {
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
    }
    saveTodoList();
}