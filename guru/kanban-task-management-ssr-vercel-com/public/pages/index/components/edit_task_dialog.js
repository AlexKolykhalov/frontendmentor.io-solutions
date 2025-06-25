// @ts-check

import { Board }        from "./board.js";
import { Column }       from "./column.js";
import { Task }         from "./task.js";
import { DynamicList }  from "./dynamic_list.js";
import { emit, insert } from "./helpers.js";

export class EditTaskDialog {

  /** @type { {task:import("./task.js").TaskType, column_id:string} } */
  static #state = {
    task: {
      id: "",
      title: "",
      description: "",
      subtasks: [{ id: "", title: "", isCompleted: false }]
    },
    column_id: ""
  };

  /** @returns { {task:import("./task.js").TaskType, column_id:string} } */
  static #getState() {
    return JSON.parse(JSON.stringify(this.#state));
  }

  /** @param { {task:import("./task.js").TaskType, column_id:string} } value */
  static #setState(value) {
    return this.#state = value;
  }

  /** @returns {string} HTML string */
  static template() {

    const state = EditTaskDialog.#getState();

    const ul = document.querySelector(`#${Board.prefix} ul`);
    if (!ul) throw new Error(`Missing #${Board.prefix} <ul>`);
    const columns = [...ul.children].map(
      column => {
	const id = column.getAttribute("id");
	const h3 = column.querySelector("h3");

	if (!id) throw new Error(`Missing "id" attribute in "Column" template`);
	if (!h3) throw new Error(`Missing li id="${Column.prefix}-" <h3>`);

	const idValue = id.slice(`${Column.prefix}-`.length);
	const name    = h3.textContent?.slice(0, h3.textContent.lastIndexOf("(") - 1);

	return `<option value="${idValue}" ${idValue === state.column_id ? "selected" : ""}>${name}</option>`;
      }
    ).join("");

    return `<dialog>
              <div class="column gap-l">
                <div class="row gap-m main-axis-space-between">
                  <h2>Edit task</h2>
                  <button aria-label="close"><img src="/images/svg/icon-cross.svg" alt=""></button>
                </div>
                <div class="column">
                  <label for="task_name">Task Name</label>
                  <input id="task_name" placeholder="e.g. Take a break" value="${state.task.title}">
                </div>
                <div class="column">
                  <label for="task_description">Description</label>
                  <textarea id="task_description" maxlength="300" cols="30" rows="6" style="resize:none;">${state.task.description}</textarea>
                </div>
                <dynamic-list></dynamic-list>
                <div class="column">
                  <label for="current_status">Current Status</label>
                  <select id="current_status">${columns}</select>
                </div>
                <div class="row gap-m">
                  <button disabled>Save Changes</button>
                  <button disabled>Revert</button>
                </div>
              </div>
            </dialog>`;
  }

  /**
   * @param {import("./task.js").TaskType} task
   *
   * @returns {Element}
   */
  static init(task) {

    const columnID = document
      .querySelector(`#${Task.prefix}-${task.id}`) // gets clicked task
      ?.closest(`[id^='${Column.prefix}-']`)       // find the closest column for this task
      ?.getAttribute("id")
      ?.slice(`${Column.prefix}-`.length);         // gets column id

    if (!columnID) throw new Error(`Missing column ID`);

    this.#setState({ task: task, column_id: columnID });

    const component = EditTaskDialog.#create();

    /** @type {import("./dynamic_list_item.js").DynamicListItemType[]} */
    const dynamicListItems = task.subtasks.map(subtask => {
      return {
	inputID: subtask.id,
	inputPlaceholder: "e.g. Make a coffee",
	inputValue: subtask.title,
	deleteBtnDisabled: task.subtasks.length === 1 ? true : false
      };
    });

    insert(
      DynamicList.init({
	title: "Subtasks",
	items: dynamicListItems,
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
    template.innerHTML = EditTaskDialog.template();
    const component    = template.content.firstElementChild;
    if (!component) throw new Error("Can't create \"AddNewTaskDialog\" component");

    EditTaskDialog.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   *
   * @returns {void}
   */
  static handleEvents(component) {
    const controlBtns = component.querySelectorAll("button");
    const saveBtn     = controlBtns[1];
    const revertBtn   = controlBtns[2];

    const input = component.querySelector("#task_name");
    if (!input) throw new Error("Missing <input id=\"task_name\">");
    input.addEventListener("input", function() {
      this.removeAttribute("style");
      checkEditTaskDialogState();
    });

    const textarea = component.querySelector("#task_description");
    if (!textarea) throw new Error("Missing <input id=\"task_description\">");
    textarea.addEventListener("input", () => checkEditTaskDialogState());

    const select = component.querySelector("#current_status");
    if (!select) throw new Error("Missing <select id=\"current_status\">");
    select.addEventListener("input", function () {
      select.querySelector("option[selected]")?.removeAttribute("selected");
      // @ts-ignore
      const elem = [...select.children].find(item => item.value === select.value);
      elem?.setAttribute("selected", "");

      checkEditTaskDialogState();
    });

    saveBtn.addEventListener("click", async function() {

      if (!EditTaskDialog.#validation(component)) return;

      const state = EditTaskDialog.#getState();
      const sendingTaskData = EditTaskDialog.#getDifferences(component);
      if (!sendingTaskData) throw new Error("Missing <select id=\"current_status\">");

      console.log(sendingTaskData);

      const response = await fetch("http://localhost:4000/rpc/update_task", {
	method: "POST",
	headers: {
	  "Content-Type": "application/json",
	  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYXV0aF91c2VyIn0.XC5n_hafVOMV1Ve7S2_5A0K5TmWURd_Q-zsoZgBFUTo",
	},
	body: JSON.stringify({
	  p_task: sendingTaskData.task,
	  p_column_id: sendingTaskData.column_id
	}),
      });

      if (response.status === 401) throw new Error("Authentication error");
      if (response.status !== 200) throw new Error("Unexpected response status");

      const receivingTaskData = await response.json();      

      if (sendingTaskData.column_id !== state.column_id) {
	// move task from one column to another
	const increasedColumn = document.querySelector(`#column-${sendingTaskData.column_id}`);
	const reducedColumn   = document.querySelector(`#column-${state.column_id}`);
	if (!increasedColumn) throw new Error(`Can't find <li id="${sendingTaskData.column_id}">`);
	if (!reducedColumn)   throw new Error(`Can't find <li id="${state.column_id}">`);

	emit("task:deleted", receivingTaskData, reducedColumn);
	emit("task:created", receivingTaskData, increasedColumn);
      } else {
	const selectedColumn = document.querySelector(`#column-${state.column_id}`);
	if (!selectedColumn) throw new Error(`Can't find <li id="${state.column_id}">`);
	
	// update task without moving
	emit("task:updated", receivingTaskData, selectedColumn);
      }

      component.remove();

    });

    revertBtn.addEventListener("click", function() {
      /** @type {HTMLInputElement|null} */
      const taskNameInput    = component.querySelector("#task_name");
      /** @type {HTMLTextAreaElement|null} */
      const descriptionInput = component.querySelector("#task_description");
      const select           = component.querySelector("select"); // contains column id
      const listOfSubtasks   = component.querySelector("ul");
      if (!taskNameInput)    throw new Error("Missing <input id=\"task_name\">");
      if (!descriptionInput) throw new Error("Missing <textarea id=\"task_description\">");
      if (!select)           throw new Error("Can't find <select>");
      if (!listOfSubtasks)   throw new Error("Missing <ul>");

      const state = EditTaskDialog.#getState();

      taskNameInput.value    = state.task.title;
      descriptionInput.value = state.task.description;
      // @ts-ignore
      const elem = [...select.children].find(item => item.value === state.column_id);

      if (!elem) throw new Error(`Can't find <option> with ${state.column_id} value`);
      select.querySelector("option[selected]")?.removeAttribute("selected");
      elem.setAttribute("selected", "");

      /** @type {import("./dynamic_list_item.js").DynamicListItemType[]} */
      const dynamicListItems = state.task.subtasks.map(subtask => {
	return {
	  inputID: subtask.id,
	  inputPlaceholder: "e.g. Make a coffee",
	  inputValue: subtask.title,
	  deleteBtnDisabled: state.task.subtasks.length === 1 ? true : false
	};
      });

      insert(
	DynamicList.init({
	  title: "Subtasks",
	  items: dynamicListItems,
	  btnText: "+ Add New Subtask",
	  limit: 8
	}),
	"div.column.gap-sm",
	component
      );

      saveBtn.setAttribute("disabled", "");
      revertBtn.setAttribute("disabled", "");
    });

    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error("Can't find <button aria-label=\"close\">");
    closeDialogBtn.addEventListener("click", () => component.remove());

    component.addEventListener("dynamic-list-item:change", () => checkEditTaskDialogState());
    component.addEventListener("dynamic-list-item:add",    () => checkEditTaskDialogState());
    component.addEventListener("dynamic-list-item:remove", () => checkEditTaskDialogState());

    function checkEditTaskDialogState() {
      if (EditTaskDialog.#getDifferences(component)) {
	saveBtn.removeAttribute("disabled");
	revertBtn.removeAttribute("disabled");
      } else {
	saveBtn.setAttribute("disabled", "");
	revertBtn.setAttribute("disabled", "");
      }
    }
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

  /**
   * @param {Element} component
   *
   * @returns {{task:import("./task.js").TaskType, column_id:string}|null} Returns differences or null (no differences)
   */
  static #getDifferences(component) {
    /** @type {HTMLInputElement|null} */
    const taskNameInput    = component.querySelector("#task_name");
    /** @type {HTMLTextAreaElement|null} */
    const descriptionInput = component.querySelector("#task_description");
    const select           = component.querySelector("select"); // contains column id
    const listOfSubtasks   = component.querySelector("ul");
    if (!taskNameInput)    throw new Error("Missing <input id=\"task_name\">");
    if (!descriptionInput) throw new Error("Missing <textarea id=\"task_description\">");
    if (!select)           throw new Error("Can't find <select>");
    if (!listOfSubtasks)   throw new Error("Missing <ul>");

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

    if (stateData.column_id !== select.value) {
      flag = true;
      stateData.column_id = select.value;
    }

    for (let i = 0; i < stateData.task.subtasks.length; i++) {
      let isDelete = true;
      for (let j = 0; j < [...listOfSubtasks.children].length; j++) {
	const input = [...listOfSubtasks.children][j].querySelector("input");
	if (!input) throw new Error("Missing <input> in <li> element");
	const idAttr = input.getAttribute("id");
	if (!idAttr) throw new Error("Missing ID attribute in <input>");

	const id = idAttr.slice(`x-`.length);

	if (i === 0 && id.length !== 36) { // i === 0 it's helps push only once
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
