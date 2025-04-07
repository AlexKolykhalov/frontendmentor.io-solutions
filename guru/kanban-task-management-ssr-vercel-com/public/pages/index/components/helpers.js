// @ts-check

import { Board } from "./board.js";

/**
 * Generates a string with random symbols.
 * @param {number} length - The length of a string with random symbols.
 * @returns {string}
 */
export function generateRandomSymbols(length) {
  const symbols     = "0123456789abcdefghABCDEFGH";
  let randomSymbols = "";
  for (let i = 0; i < length; i++) {
    randomSymbols += symbols[Math.floor(Math.random() * symbols.length)];
  }

  return randomSymbols;
}

/**
 * Emit custom event.
 * @param {string} type   - The event type.
 * @param {object} detail - Any details to pass along with the event.
 * @param {Node}   elem   - The element to attach the event to.
 */
export function emit(type, detail = {}, elem) {
  if (!type) return;

  return elem.dispatchEvent(
    new CustomEvent(type, { bubbles: false, cancelable: true, detail: detail })
  );
}

/**
 * Inserts a HTML text or an Element instead of the selected element into the component.
 * @param {Element|string} variable
 * @param {string} selector - Replacement element selector.
 * @param {Element} component
 * @throws {Error} - If we can't find an element with this `selector`.
 * @returns {void}
 */
export function insert(variable, selector, component) {
  const tag = component.querySelector(selector);
  if (!tag) throw new Error(`Can't find <${selector}>`);
  typeof variable === "string" ?
    tag.insertAdjacentHTML("afterend", variable):
    tag.insertAdjacentElement("afterend", variable);

  tag.remove();
}

/** @returns {string} */
export function getCurrentBoardId() {
  const board = document.querySelector(`[id^=${Board.prefix}-]`);  
  if (!board) throw new Error(`Can't find <section id="${Board.prefix}-">`);
  const boardId = board.getAttribute("id");
  if (!boardId) throw new Error(`Can't find id attribute in <section id="${Board.prefix}-">`);
  
  return boardId.slice(`${Board.prefix}-`.length);
}

/**
 * @param {string} boardId
 * @returns {import("./types").Board}
 */
export function getBoardData(boardId) {  
  return glob.find(board => board.id === boardId);
}

/**
 * @param {import("./types.js").Board} board
 * @returns {void}
 */
export function addBoardData(board) {
  glob.push(board);
  console.log(glob);
}

// /**
//  * Returns list of columns by boardId.
//  * @param {string} boardId
//  * @returns {Array<import("./types.js").Column>}
//  */
// export function getBoardColumnsData(boardId) {
//   const index = glob.indexOf(glob.find(board => board.id === boardId));
//   return glob[index].columns;
// }

/** 
 * @param {string} boardId
 * @param {string} columnId
 * @returns {import("./types.js").Column}
 */
export function getColumnData(boardId, columnId) {
  const index = glob.indexOf(glob.find(board => board.id === boardId));
  return glob[index].columns.find(column => column.id === columnId);
}

/**
 * @param {string} boardId
 * @param {import("./types").Column} column
 * @returns {void}
 */
export function addColumnData(boardId, column) {
  const boardIndex = glob.indexOf(glob.find(board => board.id === boardId));
  glob[boardIndex].columns.push(column);
  console.log(glob);
}

/**
 * Returns task data from the global state.
 * @param {string} boardId
 * @param {string} columnId
 * @param {string} taskId
 * @returns {import("./types").Task}
 */
export function getTaskData(boardId, columnId, taskId) {
  const boardIndex  = glob.indexOf(glob.find(board => board.id === boardId));
  const columnIndex = glob[boardIndex].columns.indexOf(glob[boardIndex].columns.find(column => column.id === columnId));
  return glob[boardIndex].columns[columnIndex].tasks.find(task => task.id === taskId);
}

/**
 * @param {string} boardId
 * @param {string} columnId
 * @param {import("./types").Task} task
 * @returns {void}
 */
export function addTaskData(boardId, columnId, task) {
  const boardIndex  = glob.indexOf(glob.find(board => board.id === boardId));
  const columnIndex = glob[boardIndex].columns.indexOf(glob[boardIndex].columns.find(column => column.id === columnId));
  glob[boardIndex].columns[columnIndex].tasks.push(task);
  console.log(glob);
}

export function getSubtask(boardId, columnId, taskId, subtaskId) {}
