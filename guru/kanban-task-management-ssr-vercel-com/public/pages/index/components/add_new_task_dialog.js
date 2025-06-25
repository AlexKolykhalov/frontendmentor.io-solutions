// @ts-check

import { Board }        from "./board.js";
import { Column }       from "./column.js";
import { DynamicList }  from "./dynamic_list.js";
import { emit, insert } from "./helpers.js";

export class AddNewTaskDialog {
  /**
   * @returns {string} HTML string
   */
  static template() {
    const ul = document.querySelector(`#${Board.prefix} ul`);
    if (!ul) throw new Error(`Missing #${Board.prefix} <ul>`);
    const columns = [...ul.children].map(
      (column, index) => {
	const id = column.getAttribute("id");
	const h3 = column.querySelector("h3");

	if (!id) throw new Error(`Missing "id" attribute in "Column" template`);
	if (!h3) throw new Error(`Missing li id="${Column.prefix}-" <h3>`);

	const idValue = id.slice(`${Column.prefix}-`.length);	
	const name    = h3.textContent?.slice(0, h3.textContent.lastIndexOf("(") - 1);

	return `<option value="${idValue}" ${index === 0 ? "selected" : ""}>${name}</option>`;
      }
    ).join("");

    return `<dialog>
              <div class="column gap-l">
                <div class="row gap-m main-axis-space-between">
                  <h2>Add new task</h2>
                  <button aria-label="close"><img src="/images/svg/icon-cross.svg" alt=""></button>
                </div>
                <div class="column">
                  <label for="task_name">Task Name</label>
                  <input id="task_name" placeholder="e.g. Take a break">
                </div>
                <div class="column">
                  <label for="task_description">Description</label>
                  <textarea id="task_description" maxlength="300" cols="30" rows="6" style="resize:none;"></textarea>
                </div>
                <dynamic-list></dynamic-list>
                <div class="column">
                  <label for="current_status">Current Status</label>
                  <select id="current_status">${columns}</select>
                </div>
                <button>Create Task</button>
              </div>
            </dialog>`;
  }

  /** @returns {Element} */
  static init() {
    const component = AddNewTaskDialog.#create();

    insert(
      DynamicList.init({
	title: "Subtasks",
	items: [{ inputPlaceholder: "e.g. Make a coffee", deleteBtnDisabled: true }],
	btnText: "+ Add New Subtask",
	limit: 8
      }),
      "dynamic-list",
      component
    );

    return component;
  }

  /** @returns {Element} */
  static #create() {
    const template     = document.createElement("template");
    template.innerHTML = AddNewTaskDialog.template();
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

    const select = component.querySelector("#current_status");
    if (!select) throw new Error("Missing <select id=\"current_status\">");
    select.addEventListener("input", function () {
      select.querySelector("option[selected]")?.removeAttribute("selected");
      // @ts-ignore
      const elem = [...select.children].find(item => item.value === select.value);
      elem?.setAttribute("selected", "");      
    });

    const createNewTaskBtn = component.querySelector("dynamic-list + div + button");
    if (!createNewTaskBtn) throw new Error("Can't find \"Create Task\" button");
    createNewTaskBtn.addEventListener("click", async function() {
      if (!AddNewTaskDialog.#validation(component)) return;

      /** @type {HTMLInputElement|null} */
      const taskName     = component.querySelector("#task_name");
      /** @type {HTMLInputElement|null} */
      const description  = component.querySelector("#task_description");
      const subtasksList = component.querySelector("ul");
      const select       = component.querySelector("select"); // contains column id

      if (!taskName)     throw new Error("Can't find <input id=\"task_name\">");
      if (!description)  throw new Error("Can't find <textarea id=\"task_description\">");
      if (!subtasksList) throw new Error("Can't find <ul>");
      if (!select)       throw new Error("Can't find <select>");

      const selectedColumn = document.querySelector(`#column-${select.value}`);
      if (!selectedColumn) throw new Error(`Can't find <li id="${select.value}">`);

      /** @type {import("./task.js").TaskType} */
      const task = {
	id: "",
	title: taskName.value.trim(),
	description: description.value.trim(),	
	subtasks: [...subtasksList.children].map(
	  item => {
	    const input = item.querySelector("input");
	    if (!input) throw new Error("Missing <input>");

	    return { id: "", title: input.value.trim(), isCompleted: false };	    
	  }
	)
      };

      const response = await fetch("http://localhost:4000/rpc/create_task", {
	method: "POST",
	headers: {
	  "Content-Type": "application/json",
	  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYXV0aF91c2VyIn0.XC5n_hafVOMV1Ve7S2_5A0K5TmWURd_Q-zsoZgBFUTo",
	},
	body: JSON.stringify({
	  p_task: task,
	  p_column_id: select.value
	}),
      });

      if (response.status === 401) throw new Error("Authentication error");
      if (response.status !== 200) throw new Error("Unexpected response status");

      emit("task:created", await response.json(), selectedColumn);

      component.remove();
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
