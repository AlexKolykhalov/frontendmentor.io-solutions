// @ts-check

import { Task }         from "./task.js";
import { injectEvents } from "../js/inject.js";
import { emit, insert } from "./helpers.js";

/**
 * @typedef {Object} ColumnType
 * @property {string} id
 * @property {string} name
 * @property {import("./task.js").TaskType[]} tasks
 */

export class Column {

  static prefix = "column";

  /**
   * @param {ColumnType} column
   * @returns {string} HTML string
   */
  static template(column) {
    return `<li id="${this.prefix}-${column.id}">
              <article class="pad-h-m">
                <h3 class="fs-300 clr-n-600 letter-spacing-m pad-v-m">${column.name} (${column.tasks.length})</h3>
                <ul class="column gap-m">
                  ${column.tasks.map(task => Task.template(task)).join("")}
                </ul>
              </article>
            </li>`;
  }

  /**
   * @param {ColumnType} column
   * @returns {Element}
   */
  static init(column) {
    const component = Column.#create(column);
    injectEvents(component); // adds events for children (Tasks)

    return component;
  }

  /**
   * @param {ColumnType} column
   * @returns {Element}
   */
  static #create(column) {
    const template     = document.createElement("template");
    template.innerHTML = Column.template(column);
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error(`Can't create ${Column.prefix} component`);

    Column.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static handleEvents(component) {
    component.addEventListener("dragover", (e) => e.preventDefault());
    
    component.addEventListener("drop", async (e) => {
      if (!e.currentTarget) return;
      
      const moving = document.querySelector(".moving");
      if (!moving) throw new Error('Missing element with "moving" class');

      const taskIDAttr = moving.getAttribute("id");
      if (!taskIDAttr) throw new Error("Missing ID attribute in <li> task");

      const columnFrom = moving.closest(`[id^="${Column.prefix}-"]`);
      if (!columnFrom) throw new Error(`Missing [id="${Column.prefix}-"]`);
      const columnFromIDAttr = columnFrom.getAttribute("id");
      if (!columnFromIDAttr) throw new Error("Missing ID attribute in <li> column");
      // @ts-ignore
      const columnToIDAttr = e.currentTarget.getAttribute("id");
      if (!columnToIDAttr) throw new Error("Missing ID attribute in <li> column");

      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();

      const taskID       = taskIDAttr.slice(`${Task.prefix}-`.length);
      const columnIDFrom = columnFromIDAttr.slice(`${Column.prefix}-`.length);
      const columnIDTo   = columnToIDAttr.slice(`${Column.prefix}-`.length);

      if (columnIDFrom !== columnIDTo) {
	const response = await fetch("http://localhost:4000/rpc/drag_drop_task", {
	  method: "POST",
	  headers: {
	    "Content-Type": "application/json",
	    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYXV0aF91c2VyIn0.XC5n_hafVOMV1Ve7S2_5A0K5TmWURd_Q-zsoZgBFUTo",
	  },
	  body: JSON.stringify({
	    p_column_id_to: columnIDTo,
	    p_task_id:      taskID,
	  }),
	});

	if (response.status === 401) throw new Error("Authentication error");
	if (response.status !== 200) throw new Error("Unexpected response status");

	const receivingTaskData = await response.json();

	// move task from one column to another
	const increasedColumn = document.querySelector(`#column-${columnIDTo}`);
	const reducedColumn   = document.querySelector(`#column-${columnIDFrom}`);
	if (!increasedColumn) throw new Error(`Can't find <li id="${columnIDTo}">`);
	if (!reducedColumn)   throw new Error(`Can't find <li id="${columnIDFrom}">`);

	emit("task:deleted", receivingTaskData, reducedColumn);
	emit("task:created", receivingTaskData, increasedColumn);
      }

      moving.classList.remove("moving");
    });
    
    component.addEventListener("task:created", (event) => {
      const h3 = component.querySelector("h3");
      const ul = component.querySelector("ul");

      if (!h3) throw new Error("Missing <h3> tag");
      if (!ul) throw new Error("Missing <ul> tag");

      // insert new task
      // @ts-ignore
      ul.insertAdjacentElement("beforeend", Task.init(event.detail));

      //changes a <h3> (count of the tasks)
      const name = h3.textContent?.slice(0, h3.textContent.lastIndexOf("(") - 1);
      h3.textContent = `${name} (${ul.children.length})`;

      console.log("task:created");
    });

    component.addEventListener("task:updated", (event) => {
      // @ts-ignore
      insert(Task.init(event.detail), `#${Task.prefix}-${event.detail.id}`, component);
      
      console.log("task:updated");
    });

    component.addEventListener("task:deleted", (event) => {
      const h3 = component.querySelector("h3");
      const ul = component.querySelector("ul");

      if (!h3) throw new Error("Missing <h3> tag");
      if (!ul) throw new Error("Missing <ul> tag");

      // delete task
      // @ts-ignore
      ul.querySelector(`#${Task.prefix}-${event.detail.id}`)?.remove();

      //changes a <h3> (count of the tasks)
      const name = h3.textContent?.slice(0, h3.textContent.lastIndexOf("(") - 1);
      h3.textContent = `${name} (${ul.children.length})`;

      console.log("task:deleted");
    });
  }
  
}
