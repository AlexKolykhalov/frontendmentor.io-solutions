// @ts-check

import { Task } from "./task.js";

/**
 * @typedef {Object}                          ColumnType
 * @property {string}                         id
 * @property {string}                         name
 * @property {import("./task.js").TaskType[]} tasks
 */

/**
 * @typedef {Object}      ColumnComponentType
 * @property {ColumnType} column
 */

export class Column { // listens to [column:updated, task:created, updated, deleted]
  static prefix = "column"; // using in edit_board_dialog.js

  /**
   * @param {ColumnComponentType} props
   * @returns {string} HTML string
   */
  static template(props) {
    const isSSR = typeof window === "undefined" && typeof document === "undefined";
    const tasks = isSSR ?
	  props.column.tasks.map(task => Task.template({ task: task })).join("") :
	  "<tasks></tasks>";
    if (isSSR) globalThis.paths[this.prefix] = "/pages/index/components/column.js";

    return `<li data-prefix="${this.prefix}" data-id="${props.column.id}">
              <article class="pad-h-m">
                <h3 class="fs-300 clr-n-600 letter-spacing-m pad-v-m">${props.column.name} (${props.column.tasks.length})</h3>
                <ul class="column gap-m">${tasks}</ul>
              </article>
            </li>`;
  }

  /**
   * @param {ColumnComponentType} props
   * @returns {Element}
   */
  static init(props) {
    const component = this.#create(props);
    const fragment  = document.createDocumentFragment();
    const tasks     = component.querySelector("tasks");
    if (!tasks)     throw new Error("<tasks> is missing");

    props.column.tasks.forEach(task => { fragment.appendChild(Task.init({ task: task })) });
    tasks.replaceWith(fragment)

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
    if (!component)    throw new Error(`Can't create ${this.name} component`);

    this.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static handleEvents(component) {
    component.addEventListener("dragover", (event) => event.preventDefault());

    component.addEventListener("drop", async (event) => {
      if (!event.currentTarget) return;
      const moving = document.querySelector(".moving");
      if (!moving) throw new Error("Task element with .moving class is missing");

      const columnFrom = moving.closest(`[data-prefix="${Column.prefix}"]`);
      const columnTo   = component;

      event.stopPropagation();
      event.stopImmediatePropagation();
      event.preventDefault();

      moving.classList.remove("moving");

      if (columnFrom === columnTo) return;

      if (globalThis.client_variables.is_anonymous) {
	columnTo.querySelector("ul")?.appendChild(moving);

	[columnFrom, columnTo].forEach(item => {
	  item?.dispatchEvent(new CustomEvent("column:updated"));
	});

	return;
      }

      const taskID   = moving.getAttribute("data-id");
      const columnID = columnTo.getAttribute("data-id");
      if (!taskID)   throw new Error(`${Task.prefix} [data-id] is missing`);
      if (!columnID) throw new Error(`${Column.prefix} [data-id] is missing`);
      
      const url      = `http://localhost:3000/v1/tasks/${taskID}`;
      const options  = {
	method: "PATCH",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({ columnID: columnID })
      };

      // append a Task placeholder
      // add indicator
      const { LoaderRipple } = await import("../../_shared/components/loader_ripple.js");
      const loader = LoaderRipple.init();
      loader.setAttribute("style", "top: 5%; right: 2.5%"); // customize position inside task component
      moving.appendChild(loader);
      moving.setAttribute("style", "background-color: var(--bg-n-100-900); color: var(--clr-neutral-600)");
      columnTo.querySelector("ul")?.appendChild(moving);

      // [Errors 401, 403, 404, 405, 500] [Success 200]
      const response = await fetch(url, options);

      if (response.status === 401 || response.status === 403 ||
	  response.status === 404 || response.status !== 200) {

	moving.removeAttribute("style");
	loader.remove();
	columnFrom?.querySelector("ul")?.appendChild(moving);
      }

      if (response.status === 401 || response.status === 403) {
	if (response.status === 401) {
	  const { openAuthzDialog } = await import("../functions.js");
	  await openAuthzDialog();
	}

	if (response.status === 403) {
	  const { openSessionExpiredDialog } = await import("../functions.js");
	  await openSessionExpiredDialog();
	}

	return;
      }

      if (response.status === 404 || response.status !== 200) {
	const { openPopUp } = await import("../../_shared/functions.js");
	await openPopUp(
	  response.status === 404 ? "Search error" : "Server error",
	  response.status === 404 ? "Task not found" : "Something went wrong. Try again"
	);

	return;
      }

      moving.removeAttribute("style");
      loader.remove();
      [columnFrom, columnTo].forEach(item => {
	item?.dispatchEvent(new CustomEvent("column:updated"));
      });
    });

    component.addEventListener("column:updated", () => {
      const h3 = component.querySelector("h3");
      const ul = component.querySelector("ul");
      if (!h3) throw new Error("<h3> is missing");
      if (!ul) throw new Error("<ul> is missing");

      const name = h3.textContent?.slice(0, h3.textContent.lastIndexOf("(") - 1);
      h3.textContent = `${name} (${ul.children.length})`;

      console.log("column:updated");
    });

    component.addEventListener("task:created", (event) => {
      const ul = component.querySelector("ul");
      if (!ul) throw new Error("<ul> is missing");

      // @ts-ignore
      const task   = event.detail;
      const locked = globalThis.client_variables.is_anonymous;
      ul.appendChild(Task.init({ task: task, locked: locked }));
      console.log("task:created");

      component.dispatchEvent(new CustomEvent("column:updated"));
    });

    component.addEventListener("task:updated", (event) => {
      // @ts-ignore
      const task = event.detail;
      const element = component.querySelector(`[data-id="${task.id}"]`);
      if (!element) throw new Error(`${Task.prefix} [data-id="${task.id}"] is missing`);

      element.replaceWith(
	Task.init({
	  task: task,
	  locked: globalThis.client_variables.is_anonymous
	})
      );

      console.log("task:updated");
    });

    component.addEventListener("task:deleted", (event) => {
      const ul = component.querySelector("ul");
      if (!ul) throw new Error("<ul> is missing");

      // @ts-ignore
      const taskID = event.detail;
      ul.querySelector(`[data-id="${taskID}"]`)?.remove();
      console.log("task:deleted");

      component.dispatchEvent(new CustomEvent("column:updated"));
    });
  }
}
