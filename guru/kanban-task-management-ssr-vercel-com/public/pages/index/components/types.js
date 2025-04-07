/**
 * @typedef {Object} Board
 * @property {string} id
 * @property {string} name
 * @property {Array<Column>} columns
 */

/**
 * @typedef {Object} Column
 * @property {string} id
 * @property {string} name
 * @property {Array<Task>} tasks
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {Array<Subtask>} subtasks
 */

/**
 * @typedef {Object} Subtask
 * @property {string} id
 * @property {string} title
 * @property {boolean} isCompleted
 */

export { Board, Column, Task, Subtask }
