// @ts-check

import { Task }               from "./task.js";
import { emit, insert,
	 openRedirectDialog } from "./_helpers.js";
import { Role, roles }        from "../../_shared/roles.js";

/**
 * @typedef {Object} ColumnType
 * @property {string}                         id
 * @property {string}                         name
 * @property {import("./task.js").TaskType[]} tasks
 */

/**
 * @typedef {Object} ColumnComponentType
 * @property {ColumnType} column
 */

// listens to [column:updated, task:created, updated, deleted]
export class Column {

  static prefix   = "column"; // using in edit_board_dialog.js
  static selector = `[id^=${this.prefix}-]`;

  /**
   * @param {ColumnComponentType} props
   * @param { {SSR:boolean} }     render
   *
   * @returns {string} HTML string
   */
  static template(props, render = { SSR: false }) {
    if (!render.SSR && typeof window === 'undefined' && typeof document === 'undefined')
      throw new Error("Render template error: try to add { SSR: true }");

    const path  = render.SSR ? `data-path="http://localhost:3000/pages/index/components/column.js"` : "";
    const tasks = render.SSR ? props.column.tasks.map(task => Task.template({ task: task }, { SSR: true })).join("") : "<tasks></tasks>";

    return `<li id="${this.prefix}-${props.column.id}" ${path}>
              <article class="pad-h-m">
                <h3 class="fs-300 clr-n-600 letter-spacing-m pad-v-m">${props.column.name} (${props.column.tasks.length})</h3>
                <ul class="column gap-m">${tasks}</ul>
              </article>
            </li>`;
  }

  /**
   * @param {ColumnComponentType} props
   *
   * @returns {Element}
   */
  static init(props) {
    const component = this.#create(props);

    const fragment = document.createDocumentFragment();
    props.column.tasks.forEach(task => { fragment.appendChild(Task.init({ task: task })) });

    insert(fragment, "tasks", component);

    return component;
  }

  /**
   * @param {ColumnComponentType} props
   * @returns {Element}
   */
  static #create(props) {
    const template     = document.createElement("template");
    template.innerHTML = this.template(props);
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error(`Can't create "Column" component`);

    this.handleEvents(component);

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

      // move task from one column to another
      const increasedColumn = document.querySelector(`#column-${columnIDTo}`);
      const reducedColumn   = document.querySelector(`#column-${columnIDFrom}`);
      if (!increasedColumn) throw new Error(`Can't find <li id="${columnIDTo}">`);
      if (!reducedColumn)   throw new Error(`Can't find <li id="${columnIDFrom}">`);

      moving.classList.remove("moving");

      if (columnIDFrom !== columnIDTo) {
	if (Role.getRole() === roles.ANONYMOUS) {
	  increasedColumn.querySelector("ul")?.appendChild(moving);
	  
	  emit("column:updated", {}, increasedColumn);
	  emit("column:updated", {}, reducedColumn);

	  return;
	}

	// very similar on update_task in task_dialog.js
	const url     = "http://localhost:4000/rpc/drag_drop_task";
	const options = {
	  method: "POST",
	  headers: {
	    "Content-Type": "application/json",
	    "Authorization": `Bearer ${ localStorage.getItem("bearer") }`,
	  },
	  body: JSON.stringify({
	    p_column_id_to: columnIDTo,
	    p_task_id:      taskID,
	  }),
	};

	// [Errors 401, 403] [Success 200]
	let response = await fetch(url, options);

	if (response.status === 401) {
	  // [Errors 400, 401, 500] [Success 201]
	  const resAuthz = await fetch("http://localhost:3000/api/generate_authz_token", { method: "POST" });
	  if (resAuthz.status === 401) {
	    await openRedirectDialog();

	    return;
	  }

	  if (resAuthz.status !== 201) throw new Error("Get generate_authz_token error");

	  localStorage.setItem("bearer", await resAuthz.json());
	  options.headers.Authorization = `Bearer ${ localStorage.getItem("bearer") }`;
	  response = await fetch(url, options);
	}

	if (response.status !== 200) throw new Error("Unexpected response status");

	const receivingTaskData = await response.json();

	emit("task:deleted", receivingTaskData, reducedColumn);
	emit("task:created", receivingTaskData, increasedColumn);
      }
    });

    component.addEventListener("column:updated", () => {
      const h3 = component.querySelector("h3");
      const ul = component.querySelector("ul");
      if (!h3) throw new Error("Missing <h3> tag");
      if (!ul) throw new Error("Missing <ul> tag");

      // changes a <h3> (count of the tasks)
      const name = h3.textContent?.slice(0, h3.textContent.lastIndexOf("(") - 1);
      h3.textContent = `${name} (${ul.children.length})`;

      console.log("column:updated");
    });

    component.addEventListener("task:created", (event) => {
      const ul = component.querySelector("ul");
      if (!ul) throw new Error("Missing <ul> tag");

      // @ts-ignore
      const task = event.detail;
      // insert new task
      ul.appendChild( Task.init({ task: task, locked: Role.getRole() === roles.ANONYMOUS }) );

      emit("column:updated", {}, component);

      console.log("task:created");
    });

    component.addEventListener("task:updated", (event) => {
      // @ts-ignore
      const task = event.detail;
      insert(Task.init({ task: task }), `#${Task.prefix}-${task.id}`, component);

      console.log("task:updated");
    });

    component.addEventListener("task:deleted", (event) => {
      const ul = component.querySelector("ul");
      if (!ul) throw new Error("Missing <ul> tag");

      // @ts-ignore
      const task = event.detail;
      // delete task
      ul.querySelector(`#${Task.prefix}-${task.id}`)?.remove();

      emit("column:updated", {}, component);

      console.log("task:deleted");
    });
  }
}
