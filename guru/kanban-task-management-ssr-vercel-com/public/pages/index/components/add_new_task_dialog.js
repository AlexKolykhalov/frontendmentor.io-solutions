// @ts-check

import { Column } from "./column.js";
import { DynamicList } from "./dynamic_list.js";
import { emit, insert, getCurrentBoardId, addTaskData, getBoardData } from "./helpers.js";

export class AddNewTaskDialog {
  /**
   * @param {Array<import("./types.js").Column>} columns
   * @returns {string} HTML string
   */
  static template(columns) {
    return `<dialog>
              <div class="column gap-l">
                <div class="row gap-m main-axis-space-between">
                  <h2>Add new task</h2>
                  <button aria-label="close"><img src="/images/svg/icon-cross.svg" alt=""></button>
                </div>
                <div class="column">
                  <label for="task_name">Tasks Name</label>
                  <input id="task_name" placeholder="e.g. Take a break">
                </div>
                <div class="column">
                  <label for="task_description">Description</label>
                  <textarea id="task_description" maxlength="300" cols="30" rows="6" style="resize:none;"></textarea>
                </div>
                <dynamic-list></dynamic-list>
                <div class="column">
                  <label for="current_status">Current Status</label>
                  <select id="current_status">
                    ${columns.map(column => `<option value="${column.id}">${column.name}</option>`).join("")}
                  </select>
                </div>
                <button>Create Task</button>
              </div>
            </dialog>`;
  }

  /** @returns {Element} */
  static init() {
    const component = AddNewTaskDialog.#create(getBoardData(getCurrentBoardId()).columns);
    insert(
      DynamicList.init({
	title: "Subtasks",
	items: [{ value: "", placeholder: "e.g. Make a coffee", disabled: true }],
	btnText: "+ Add New Subtask",
	limit: 8
      }),
      "dynamic-list",
      component
    );

    return component;
  }

  /**
   * @param {Array<import("./types.js").Column>} columns
   * @returns {Element}
   */
  static #create(columns) {
    const template     = document.createElement("template");
    template.innerHTML = AddNewTaskDialog.template(columns);
    const component    = template.content.firstElementChild;
    if (!component) throw new Error("Can't create \"AddNewTaskDialog\" component");

    AddNewTaskDialog.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static handleEvents(component) {
    const input = component.querySelector("#task_name");
    if (!input) throw new Error("Can't find <input id=\"task_name\">");
    input.addEventListener("input", function() { this.removeAttribute("style"); });

    const createNewTaskBtn = component.querySelector("dynamic-list + div + button");
    if (!createNewTaskBtn) throw new Error("Can't find <dinamic-list> + <div> + <button>");
    createNewTaskBtn.addEventListener("click", async function() {
      if (!AddNewTaskDialog.#validation(component)) return;

      const taskName     = component.querySelector("#task_name");
      const description  = component.querySelector("#task_description");
      const subtasksList = component.querySelector("ul");
      const select       = component.querySelector("select"); // contains column id

      if (!taskName)     throw new Error("Can't find <input id=\"task_name\">");
      if (!description)  throw new Error("Can't find <textarea id=\"task_description\">");
      if (!subtasksList) throw new Error("Can't find <ul>");
      if (!select)       throw new Error("Can't find <select>");

      const dispatchedColumn = document.querySelector(`#${select.value}`);
      if (!dispatchedColumn) throw new Error(`Can't find <li id="${select.value}">`);

      try {
	const response = await fetch("/api/task", {
	  method: "POST",
	  headers: {"Content-Type": "application/json"},
	  body: JSON.stringify({
	    column_id: select.value.slice(`${Column.prefix}-`.length),
	    task: {
              title: taskName.value.trim(),
	      description: description.value.trim(),
              subtasks: [...subtasksList.children].map(item => {
		return {
		  title: item.querySelector("input")?.value.trim() ?? "",
		  isCompleted: false,
		};
              })
	    }
	  }),
	});
	if (response.status === 201) {
	  const data = await response.json();
	  // update global variable
	  addTaskData(getCurrentBoardId(), select.value.slice(`${Column.prefix}-`.length), data);
	  emit("task:create", data, dispatchedColumn);
	  component.remove();
	} else {
	  const error = await response.json();
	  console.log("DB ERROR: task creation", error);
	}
      } catch (error) {
	console.log("Internet error connection", error);
      }
    });

    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error("Can't find <button aria-label=\"close\">");
    closeDialogBtn.addEventListener("click", () => component.remove());
  }

  /**
   * @param {Element} component
   * @returns {boolean}
   */
  static #validation(component) {
    const inputTaskName = component.querySelector("#task_name");
    const subtasksList  = component.querySelector("ul");

    if (!inputTaskName) throw new Error("Can't find <input id=\"task_name\">");
    if (!subtasksList)  throw new Error("Can't find <ul>");

    let isValid = true;

    // @ts-ignore
    if (!inputTaskName.value.trim()) { // input (must not be empty)
      inputTaskName.setAttribute("style", "border-color: red;");
      isValid = false;
    }

    [...subtasksList.children].forEach((item) => {
      if (!item.querySelector("input")?.value.trim()) { // board of columns (must not be empty)
	item.querySelector("input")?.setAttribute("style", "border-color: red;");
	isValid = false;
      }
    });

    return isValid;
  }
}
