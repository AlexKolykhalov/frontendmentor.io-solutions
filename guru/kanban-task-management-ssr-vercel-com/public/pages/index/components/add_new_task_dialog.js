// @ts-check

import { Board }              from "./board.js";
import { Column }             from "./column.js";
import { Task }               from "./task.js";
import { DynamicList }        from "./dynamic_list.js";

export class AddNewTaskDialog {
  /** @returns {string} HTML string */
  static #template() {
    const ul = document.querySelector(`[data-prefix="${Board.prefix}"] ul`);
    if (!ul) throw new Error(`[data-prefix="${Board.prefix}"] <ul> element is missing`);

    const options = [...ul.children].map((column, index) => {
      const h3 = column.querySelector("h3");
      const id = column.getAttribute("data-id");
      if (!id) throw new Error(`[data-prefix="${Column.prefix}"] [data-id] is missing`);
      if (!h3) throw new Error(`[data-prefix="${Column.prefix}"] <h3> is missing`);
      
      const name = h3.textContent?.slice(0, h3.textContent.lastIndexOf("(") - 1);

      return `<option value="${id}" ${index === 0 ? "selected" : ""}>${name}</option>`;
    }).join("");

    return `<dialog class="bg-n-000-800">
              <div class="column gap-l">
                <div class="row gap-m main-axis-space-between">
                  <h2 class="fs-900 clr-n-900-000">Add new task</h2>
                  <button class="close-btn" aria-label="close"></button>
                </div>
                <div class="column gap-sm fs-300 fw-medium">
                  <label class="clr-n-600-000" for="task_name">Task Name</label>
                  <input class="pad-sm clr-n-900-000 bg-n-100-900" id="task_name" placeholder="e.g. Take a break">
                </div>
                <div class="column gap-sm fs-300 fw-medium">
                  <label class="clr-n-600-000" for="task_description">Description</label>
                  <textarea class="pad-sm clr-n-900-000 bg-n-100-900" id="task_description" maxlength="300" cols="30" rows="6" style="resize:none;"></textarea>
                </div>
                <dynamic-list></dynamic-list>
                <div class="column gap-sm">
                  <label class="fw-bold fs-200 clr-n-600-000" for="current_status">Current Status</label>
                  <select class="pad-sm fs-300 fw-medium clr-n-900-000 bg-n-100-900" id="current_status">${options}</select>
                </div>
                <button class="[ relative ] fw-bold fs-300 pad-h-m clr-n-000 pad-v-sm border-radius-l bg-p-purple">Create Task</button>
              </div>
            </dialog>`;
  }

  /** @returns {Element} */
  static init() {
    const component = this.#create();
    const element   = component.querySelector("dynamic-list");
    if (!element)   throw new Error("<dynamic-list> is missing");

    element.replaceWith(
      DynamicList.init({
	title: "Subtasks",
	items: [],
	btnText: "+ Add New Subtask",
	min: 0,
	max: 8
      })
    );

    return component;
  }

  /** @returns {Element} */
  static #create() {
    const template     = document.createElement("template");
    template.innerHTML = this.#template();
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error(`Can't create ${this.name} component`);

    this.#handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static #handleEvents(component) {
    const input = component.querySelector("#task_name");
    if (!input) throw new Error(`<input id="task_name"> is missing`);
    input.addEventListener("input", function() { this.removeAttribute("style") });

    const select = component.querySelector("#current_status");
    if (!select) throw new Error(`<select id="current_status"> is missing`);
    select.addEventListener("input", () => {
      select.querySelector("option[selected]")?.removeAttribute("selected");
      // @ts-ignore
      const elem = [...select.children].find(item => item.value === select.value);
      elem?.setAttribute("selected", "");
    });

    const createNewTaskBtn = component.querySelector(`dynamic-list + div + button`);
    if (!createNewTaskBtn) throw new Error(`"Create Task" button is missing`);
    createNewTaskBtn.addEventListener("click", async function() {
      
      if (!validation()) return;

      /** @type {HTMLInputElement|null} */
      const taskName     = component.querySelector("#task_name");
      /** @type {HTMLInputElement|null} */
      const description  = component.querySelector("#task_description");
      const subtasksList = component.querySelector("ul");
      const select       = component.querySelector("select"); // contains column id

      if (!taskName)     throw new Error(`<input id="task_name"> is missing`);
      if (!description)  throw new Error(`<textarea id="task_description"> is missing`);
      if (!subtasksList) throw new Error(`<ul> is missing`);
      if (!select)       throw new Error(`<select> is missing`);

      const selectedColumn = document.querySelector(`[data-id="${select.value}"]`);
      if (!selectedColumn) throw new Error(`${Column.prefix} [data-id="${select.value}"] is missing`);

      /** @type {import("./task.js").TaskType} */
      const sendingTaskData = {
	id: "",
	title: taskName.value.trim(),
	description: description.value.trim(),
	subtasks: [...subtasksList.children].map(
	  item => {
	    const input = item.querySelector("input");
	    if (!input) throw new Error("<input> element is missing");

	    return { id: "", title: input.value.trim(), isCompleted: false };
	  }
	)
      };

      if (globalThis.client_variables.is_anonymous) {
	sendingTaskData.id = crypto.randomUUID();

	const taskList = selectedColumn.querySelector("ul");
	if (!taskList) throw new Error(`#${Column.prefix} [data-id="${select.value}"] <ul> is missing`);

	taskList.appendChild(Task.init({ task: sendingTaskData, locked: true }));
	component.remove();
	selectedColumn.dispatchEvent(new CustomEvent("column:updated"));

	return;
      }

      this.setAttribute("disabled", ""); // disabled createNewTaskBtn

      // add indicator
      const { LoaderRipple } = await import("../../_shared/components/loader_ripple.js");
      const loader = LoaderRipple.init();
      loader.classList.add("clr-n-000");
      loader.setAttribute("style", "--size: 25px; right: 5%;");
      this.appendChild(loader);

      const url     = "/v1/tasks";
      const options = {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
	  task:      sendingTaskData,
	  column_id: select.value
	}),
      };
      // [Errors 401, 403, 405, 500] [Success 201]
      let response = await fetch(url, options);

      if (response.status === 401 || response.status === 403) {
	if (response.status === 401) {
	  const { openAuthzDialog } = await import("../functions.js");
	  await openAuthzDialog();
	}

	if (response.status === 403) {
	  const { openSessionExpiredDialog } = await import("../functions.js");
	  await openSessionExpiredDialog();
	}
	
	this.removeAttribute("disabled"); // enable createNewTaskBtn
	loader.remove();

	return;
      }

      if (response.status !== 201) {
	component.remove();
	const { openPopUp } = await import("../../_shared/functions.js");
	await openPopUp("Server error", "Something went wrong. Try again");
	
	return;
      }

      component.remove();
      
      const receivedTaskData = await response.json();
      selectedColumn.dispatchEvent(new CustomEvent("task:created", { detail: receivedTaskData }));
    });

    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error(`<button aria-label="close"> is missing`);
    closeDialogBtn.addEventListener("click", () => component.remove());

    // *** ADDITIONAL FUNCTIONS ***

    /** @returns {boolean} */
    function validation() {
      const inputTaskName = component.querySelector("#task_name");
      const subtasksList  = component.querySelector("ul");
      if (!inputTaskName) throw new Error(`<input id="task_name"> is missing`);
      if (!subtasksList)  throw new Error(`<ul> is missing`);

      let isValid = true;

      // @ts-ignore
      if (!inputTaskName.value.trim()) { // task name must not be empty
	inputTaskName.setAttribute("style", "border-color: red;");
	isValid = false;
      }

      [...subtasksList.children].forEach((item) => {
	if (!item.querySelector("input")?.value.trim()) { // subtask must not be empty
	  item.querySelector("input")?.setAttribute("style", "border-color: red;");
	  isValid = false;
	}
      });

      return isValid;
    }
  }
}
