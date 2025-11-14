// @ts-check

import { Board }                 from "./board.js";
import { Column }                from "./column.js";
import { Task }                  from "./task.js";
import { DynamicList }           from "./dynamic_list.js";
import { generateRandomSymbols } from "../functions.js";

// listens to [dynamic-list-item:changed, added, removed]
export class EditTaskDialog {
  /** @type {{task:import("./task.js").TaskType, columnID:string}} */
  static #state = {
    task: { id: "", title: "", description: "", subtasks: [] },
    columnID: ""
  };

  /** @returns {{task:import("./task.js").TaskType, columnID:string}} */
  static #getState() {
    return JSON.parse(JSON.stringify(this.#state));
  }

  /** @param {{task:import("./task.js").TaskType, columnID:string}} value */
  static #setState(value) {
    this.#state = value;
  }

  /** @returns {string} HTML string */
  static #template() {
    const columnsList = document.querySelector(`[data-prefix="${Board.prefix}"] ul`);
    if (!columnsList) throw new Error(`[data-prefix="${Board.prefix}"] <ul> is missing`);

    const state   = this.#getState();
    const options = [...columnsList.children].map(
      column => {
	const h3 = column.querySelector("h3");
	const id = column.getAttribute("data-id");
	if (!h3) throw new Error(`${Column.prefix} <h3> is missing`);
	if (!id) throw new Error(`${Column.prefix} [data-id] is missing`);

	const taskElement = column.querySelector(`[data-id="${state.task.id}"]`);
	const name = h3.textContent?.slice(0, h3.textContent.lastIndexOf("(") - 1);

	return `<option value="${id}" ${taskElement ? "selected" : ""}>${name}</option>`;
      }
    ).join("");

    const id = generateRandomSymbols(5);
    return `<dialog class="bg-n-000-800">
              <div class="column gap-l">
                <div class="row gap-m no-wrap main-axis-space-between cross-axis-start">
                  <h2 class="fs-900 clr-n-900-000">Edit task</h2>
                  <button class="close-btn" aria-label="close"></button>
                </div>
                <div class="column gap-sm fs-300 fw-medium">
                  <label class="clr-n-600-000" for="task_name">Task Name</label>
                  <input class="pad-sm clr-n-900-000 bg-n-100-900" id="task_name" placeholder="e.g. Take a break" value="${state.task.title}">
                </div>
                <div class="column gap-sm fs-300 fw-medium">
                  <label class="clr-n-600-000" for="task_description">Description</label>
                  <textarea class="pad-sm clr-n-900-000 bg-n-100-900" id="task_description" maxlength="300" cols="30" rows="6" style="resize:none;">${state.task.description}</textarea>
                </div>
                <dynamic-list></dynamic-list>
                <div class="column gap-sm">
                  <label class="fw-bold fs-200 clr-n-600-000" for="${id}">Current Status</label>
                  <select class="pad-sm fs-300 fw-medium clr-n-900-000 bg-n-100-900" id="${id}">${options}</select>
                </div>
                <div class="row gap-l main-axis-end">
                  <button class="[ relative ] fw-bold fs-300 pad-h-l clr-n-000 pad-v-sm border-radius-l bg-p-purple" disabled>Save Changes</button>
                  <button class="fw-bold fs-300 pad-h-m clr-n-000 pad-v-sm border-radius-l bg-p-purple" disabled>Revert</button>
                </div>
              </div>
            </dialog>`;
  }

  /**
   * @param {import("./task.js").TaskType} task
   * @returns {Element}
   */
  static init(task) {
    const columnID = document.querySelector(`[data-id="${task.id}"]`)?.
      closest(`[data-prefix="${Column.prefix}"]`)?.
      getAttribute("data-id");

    if (!columnID) throw new Error(`Column [data-id] is missing`);

    this.#setState({ task: task, columnID: columnID });

    const component   = this.#create();
    const dynamicList = component.querySelector("dynamic-list");
    if (!dynamicList) throw new Error("<dynamic-list> is missing");

    dynamicList.replaceWith(
      DynamicList.init({
	title: "Subtasks",
	items: task.subtasks.map(subtask => {
	  return {
	    id: subtask.id,
	    placeholder: "e.g. Make a coffee",
	    value: subtask.title
	  }
	}),
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
    const controlBtns = component.querySelectorAll("button");
    const saveBtn     = controlBtns[1];
    const revertBtn   = controlBtns[2];

    const input = component.querySelector("#task_name");
    if (!input) throw new Error(`<input id="task_name"> is missing`);
    input.addEventListener("input", function() {
      this.removeAttribute("style");
      checkEditTaskDialogState();
    });

    const textarea = component.querySelector("#task_description");
    if (!textarea) throw new Error(`<input id="task_description"> is missing`);
    textarea.addEventListener("input", () => checkEditTaskDialogState());

    const select = component.querySelector("select");
    if (!select) throw new Error("<select> is missing");
    select.addEventListener("input", () => {
      select.querySelector("option[selected]")?.removeAttribute("selected");

      // @ts-ignore
      const elem = [...select.children].find(option => option.value === select.value);
      elem?.setAttribute("selected", "");

      checkEditTaskDialogState();
    });

    saveBtn.addEventListener("click", async function() {
      if (!validation()) return;

      const sendingTaskData = getDifferences();
      if (!sendingTaskData) return; // if no differences do nothing
      const state      = EditTaskDialog.#getState();
      const columnFrom = document.querySelector(`[data-id="${state.columnID}"]`);
      const columnTo   = document.querySelector(`[data-id="${sendingTaskData.columnID}"]`);
      if (!columnFrom) throw new Error(`[data-id="${state.columnID}"] is missing`);
      if (!columnTo)   throw new Error(`[data-id="${sendingTaskData.columnID}"] is missing`);

      if (globalThis.client_variables.is_anonymous) {
	// remove all deleted subtasks
	sendingTaskData.task.subtasks = sendingTaskData.task.subtasks.filter(
	  subtask => subtask.title !== ""
	);

	// close all opened dialogs
	document.querySelectorAll("dialog").forEach(dialog => dialog.remove());

	if (columnFrom !== columnTo) {
	  // move Task from one Column to another
	  columnFrom.dispatchEvent(new CustomEvent("task:deleted", { detail: sendingTaskData.task.id }));
	  columnTo.dispatchEvent(new CustomEvent("task:created", { detail: sendingTaskData.task }));
	} else {
	  // update Task without moving
	  columnFrom.dispatchEvent(new CustomEvent("task:updated", { detail: sendingTaskData.task }));
	}

	return;
      }

      this.setAttribute("disabled", ""); // disabled saveBtn

      // add indicator
      const { LoaderRipple } = await import("../../_shared/components/loader_ripple.js");
      const loader = LoaderRipple.init();
      loader.classList.add("clr-n-000");
      loader.setAttribute("style", "--size: 25px; right: 5%;");
      this.appendChild(loader);

      const url     = `/v1/tasks/${sendingTaskData.task.id}`;
      const options = {
	method: "PUT",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
	  task:     sendingTaskData.task,
	  columnID: sendingTaskData.columnID
	}),
      };

      // [Errors 401, 403, 404, 405, 500] [Success 200]
      const response = await fetch(url, options);

      if (response.status === 401 || response.status === 403) {
	if (response.status === 401) {
	  const { openAuthzDialog } = await import("../functions.js");
	  await openAuthzDialog();
	}

	if (response.status === 403) {
	  const { openSessionExpiredDialog } = await import("../functions.js");
	  await openSessionExpiredDialog();
	}

	this.removeAttribute("disabled"); // enabled saveBtn
	loader.remove();

	return;
      }

      if (response.status === 404 || response.status !== 200) {
	// close all opened dialogs
	document.querySelectorAll("dialog").forEach(dialog => dialog.remove());
	const { openPopUp } = await import("../../_shared/functions.js");
	await openPopUp(
	  response.status === 404 ? "Search error" : "Server error",
	  response.status === 404 ? "Task not found" : "Something went wrong. Try again"
	);

	return;
      }

      // close all opened dialogs
      document.querySelectorAll("dialog").forEach(dialog => dialog.remove());

      /** @type {import("./task.js").TaskType} */
      const receivedTaskData = await response.json();
      if (sendingTaskData.columnID !== state.columnID) {
	// move task from one Column to another
	columnFrom.dispatchEvent(new CustomEvent("task:deleted", { detail: receivedTaskData.id }));
	columnTo.dispatchEvent(new CustomEvent("task:created", { detail: receivedTaskData }));
      } else {
	// update task without moving
	columnFrom.dispatchEvent(new CustomEvent("task:updated", { detail: receivedTaskData }));
      }
    });

    revertBtn.addEventListener("click", () => {
      /** @type {HTMLInputElement|null} */
      const taskNameInput    = component.querySelector("#task_name");
      /** @type {HTMLTextAreaElement|null} */
      const descriptionInput = component.querySelector("#task_description");
      const select           = component.querySelector("select"); // contains column id
      const listOfSubtasks   = component.querySelector("ul");
      const dynamicList      = component.querySelector("[data-id]");
      if (!taskNameInput)    throw new Error(`<input id="task_name"> is missing`);
      if (!descriptionInput) throw new Error(`<textarea id="task_description"> is missing`);
      if (!select)           throw new Error("<select> is missing");
      if (!listOfSubtasks)   throw new Error("<ul> is missing");
      if (!dynamicList)      throw new Error("DynamicList is missing");

      const state = this.#getState();

      taskNameInput.value    = state.task.title;
      taskNameInput.removeAttribute("style");
      descriptionInput.value = state.task.description;
      // @ts-ignore
      const elem = [...select.children].find(item => item.value === state.columnID);
      if (!elem) throw new Error(`<option> with ${state.columnID} is missing`);

      select.querySelector("option[selected]")?.removeAttribute("selected");
      elem.setAttribute("selected", "");

      dynamicList.replaceWith(
	DynamicList.init({
	  title: "Subtasks",
	  items: state.task.subtasks.map(subtask => {
	    return {
	      id: subtask.id,
	      placeholder: "e.g. Make a coffee",
	      value: subtask.title
	    };
	  }),
	  btnText: "+ Add New Subtask",
	  min: 0,
	  max: 8
	})
      );

      saveBtn.setAttribute("disabled", "");
      revertBtn.setAttribute("disabled", "");
    });

    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error(`<button aria-label="close"> is missing`);
    closeDialogBtn.addEventListener("click", () => component.remove());

    // *** ADDITIONAL LISTENERS ***

    component.addEventListener("dynamic-list-item:changed", () => checkEditTaskDialogState());
    component.addEventListener("dynamic-list-item:added",   () => checkEditTaskDialogState());
    component.addEventListener("dynamic-list-item:removed", () => checkEditTaskDialogState());

    // *** ADDITIONAL FUNCTIONS ***

    /** @returns {void} */
    function checkEditTaskDialogState() {
      if (getDifferences()) {
	saveBtn.removeAttribute("disabled");
	revertBtn.removeAttribute("disabled");
      } else {
	saveBtn.setAttribute("disabled", "");
	revertBtn.setAttribute("disabled", "");
      }
    }

    /** @returns {boolean} */
    function validation() {
      const inputTaskName = component.querySelector("#task_name");
      const subtasksList  = component.querySelector("ul");
      if (!inputTaskName) throw new Error(`<input id="task_name"> is missing`);
      if (!subtasksList)  throw new Error("<ul> is missing");

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

    /** @returns {{task:import("./task.js").TaskType, columnID:string}|null} Returns differences or null (no differences) */
    function getDifferences() {
      /** @type {HTMLInputElement|null} */
      const taskNameInput    = component.querySelector("#task_name");
      /** @type {HTMLTextAreaElement|null} */
      const descriptionInput = component.querySelector("#task_description");
      const select           = component.querySelector("select"); // contains column id
      const listOfSubtasks   = component.querySelector("ul");
      if (!taskNameInput)    throw new Error(`<input id="task_name"> is missing`);
      if (!descriptionInput) throw new Error(`<textarea id="task_description"> is missing`);
      if (!select)           throw new Error("<select> is missing");
      if (!listOfSubtasks)   throw new Error("<ul>(subtasks) is missing");

      let   flag      = false;
      let   addings   = [];
      const stateData = EditTaskDialog.#getState();

      if (stateData.task.title !== taskNameInput.value.trim()) {
	flag = true;
	stateData.task.title = taskNameInput.value.trim();
      }

      if (stateData.task.description !== descriptionInput.value.trim()) {
	flag = true;
	stateData.task.description = descriptionInput.value.trim();
      }

      if (stateData.columnID !== select.value) {
	flag = true;
	stateData.columnID = select.value;
      }

      if (stateData.task.subtasks.length === 0 && [...listOfSubtasks.children].length > 0) {
	[...listOfSubtasks.children].forEach(item => {
	  const input = item.querySelector("input");
	  if (!input) throw new Error("<input>(subtasks) is missing");

	  addings.push({ id: "", title: input.value.trim(), isCompleted: false }); // ADD
	});

	flag = true;
      }

      for (let i = 0; i < stateData.task.subtasks.length; i++) {
	let isDelete = true;
	for (let j = 0; j < [...listOfSubtasks.children].length; j++) {
	  const input = [...listOfSubtasks.children][j].querySelector("input");
	  if (!input) throw new Error("<input>(subtasks) is missing");

	  const id = input.getAttribute("data-id");

	  if (i === 0 && !id) { // i === 0 it's helps push only once
	    addings.push({ id: "", title: input.value.trim(), isCompleted: false }); // ADD
	    flag = true;
	  };

          // checks the state's ID against the ID from the dialog
	  if (stateData.task.subtasks[i].id === id) {
	    isDelete = false; // DO NOTHING
	    if (stateData.task.subtasks[i].title !== input.value.trim()) {
	      stateData.task.subtasks[i].title = input.value.trim(); // UPDATE
	      flag = true;
	    }
	  }
	}
	if (isDelete) {
	  stateData.task.subtasks[i].title = ""; // DELETE
	  flag = true;
	}
      }
      stateData.task.subtasks.push(...addings);

      return flag ? stateData : null;
    }
  }
}
