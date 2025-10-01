// @ts-check

import { Board }                      from "./board.js";
import { Column }                     from "./column.js";
import { DynamicList }                from "./dynamic_list.js";
import { emit, generateRandomSymbols,
	 insert, openRedirectDialog,
	 openAuthzDialog }            from "./_helpers.js";

// listens to [dynamic-list-item:changed, added, removed]
export class EditTaskDialog {

  static prefix = "edit_task_dialog"; // using in dynamic_list.js

  /** @type { {task:import("./task.js").TaskType, column_id:string} } */
  static #state = {
    task: { id: "", title: "", description: "", subtasks: [] },
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
  static #template() {
    const state = this.#getState();

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

    const selectID = generateRandomSymbols(5);

    return `<dialog id="${this.prefix}" class="bg-n-000-800">
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
                  <label class="fw-bold fs-200 clr-n-600-000" for="${selectID}">Current Status</label>
                  <select class="pad-sm fs-300 fw-medium clr-n-900-000 bg-n-100-900" id="${selectID}">${columns}</select>
                </div>
                <div class="row gap-l main-axis-end">
                  <button class="[ relative ] fw-bold fs-300 pad-h-l clr-n-000 pad-v-sm border-radius-l bg-p-purple" disabled>Save Changes</button>
                  <button class="fw-bold fs-300 pad-h-m clr-n-000 pad-v-sm border-radius-l bg-p-purple" disabled>Revert</button>
                </div>
              </div>
            </dialog>`;
  }

  /**
   * @param { {task:import("./task.js").TaskType, column_id:string} } dataTask
   *
   * @returns {Element}
   */
  static init(dataTask) {
    this.#setState(dataTask);

    const component = this.#create();

    insert(
      DynamicList.init({
	title: "Subtasks",
	items: dataTask.task.subtasks.map(subtask => {
	  /** @type {import("./dynamic_list_item.js").DynamicListItemType} */
	  const item = {
	    id: subtask.id,
	    placeholder: "e.g. Make a coffee",
	    value: subtask.title	    
	  };
	  return item;
	}),
	btnText: "+ Add New Subtask",
	min: 0,
	max: 8
      }),
      "dynamic-list",
      component
    );

    return component;
  }

  /** @returns {Element} */
  static #create() {
    const template     = document.createElement("template");
    template.innerHTML = this.#template();
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error("Can't create \"AddNewTaskDialog\" component");

    this.#handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   *
   * @returns {void}
   */
  static #handleEvents(component) {
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

    const select = component.querySelector("select");
    if (!select) throw new Error("Missing <select>");
    select.addEventListener("input", function () {
      select.querySelector("option[selected]")?.removeAttribute("selected");
      // @ts-ignore
      const elem = [...select.children].find(item => item.value === select.value);
      elem?.setAttribute("selected", "");

      checkEditTaskDialogState();
    });

    saveBtn.addEventListener("click", async function() {
      if (!validation()) return;

      if (globalThis.role === "anonymous") { openAuthzDialog(); return; }

      const sendingTaskData = getDifferences();

      if (!sendingTaskData) return;

      this.setAttribute("disabled", "");
      // add indicator
      const { LoaderRipple } = await import("../../_shared/components/loader_ripple.js");
      const loader = LoaderRipple.init();
      loader.classList.add("clr-n-000");
      loader.setAttribute("style", "--size: 25px; right: 5%;");
      this.appendChild(loader);

      const url     = "http://localhost:4000/rpc/update_task";
      const options = {
	method: "POST",
	headers: {
	  "Content-Type": "application/json",
	  "Authorization": `Bearer ${ localStorage.getItem("bearer") }`,
	},
	body: JSON.stringify({
	  p_task:      sendingTaskData.task,
	  p_column_id: sendingTaskData.column_id
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

	if (resAuthz.status !== 201) {
	  const { PopUp } = await import("../../_shared/components/pop_up.js");
	  document.body.appendChild(
	    PopUp.init({
	      title: "Authentication token error",
	      message: "Something went wrong. Try again."
	    })
	  );
	  this.removeAttribute("disabled");
	  loader.remove();

	  return;
	}

	localStorage.setItem("bearer", await resAuthz.json());
	options.headers.Authorization = `Bearer ${ localStorage.getItem("bearer") }`;
	response = await fetch(url, options);
      }

      if (response.status !== 200) {
	const { PopUp } = await import("../../_shared/components/pop_up.js");
	document.body.appendChild(
	  PopUp.init({
	    title: "Server error",
	    message: "Something went wrong. Try again."
	  })
	);
	this.removeAttribute("disabled");
	loader.remove();

	return;
      }

      const receivingTaskData = await response.json();

      const state = EditTaskDialog.#getState();
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

      // close all opened dialogs
      document.querySelectorAll("dialog").forEach(dialog => dialog.remove());
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
      taskNameInput.removeAttribute("style");
      descriptionInput.value = state.task.description;
      // @ts-ignore
      const elem = [...select.children].find(item => item.value === state.column_id);

      if (!elem) throw new Error(`Can't find <option> with ${state.column_id} value`);
      select.querySelector("option[selected]")?.removeAttribute("selected");
      elem.setAttribute("selected", "");

      insert(
	DynamicList.init({
	  title: "Subtasks",
	  items: state.task.subtasks.map(subtask => {
	    /** @type {import("./dynamic_list_item.js").DynamicListItemType} */
	    const item = {
	      id: subtask.id,
	      placeholder: "e.g. Make a coffee",
	      value: subtask.title	      
	    };
	    return item;
	  }),
	  btnText: "+ Add New Subtask",
	  min: 0,
	  max: 8
	}),
	`[id^=${DynamicList.prefix}-]`,
	component
      );

      saveBtn.setAttribute("disabled", "");
      revertBtn.setAttribute("disabled", "");
    });

    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error("Can't find <button aria-label=\"close\">");
    closeDialogBtn.addEventListener("click", () => component.remove());

    // *** ADDITIONAL LISTENERS ***

    component.addEventListener("dynamic-list-item:changed", () => checkEditTaskDialogState());
    component.addEventListener("dynamic-list-item:added",   () => checkEditTaskDialogState());
    component.addEventListener("dynamic-list-item:removed", () => checkEditTaskDialogState());

    // *** ADDITIONAL FUNCTIONS ***

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

    /** @returns {{task:import("./task.js").TaskType, column_id:string}|null} Returns differences or null (no differences) */
    function getDifferences() {
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

      if (stateData.task.subtasks.length === 0 && [...listOfSubtasks.children].length > 0) {
	[...listOfSubtasks.children].forEach(item => {
	  const input = item.querySelector("input");
	  if (!input) throw new Error("Missing <input> in <li> element");

	  addings.push({ id: "", title: input.value.trim(), isCompleted: false }); // ADD
	});	

	flag = true;
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
}
