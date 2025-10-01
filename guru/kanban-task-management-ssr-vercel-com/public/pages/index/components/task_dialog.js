// @ts-check

import { Task }                        from "./task.js";
import { Board }                       from "./board.js";
import { Column }                      from "./column.js";
import { CheckList }                   from "./check_list.js";
import { CheckListItem }               from "./check_list_item.js";
import { generateRandomSymbols, insert } from "./_helpers.js";

// listens to [check-list-item:changed]
export class TaskDialog {
  /** @type { {task:import("./task.js").TaskType, column_id:string} } */
  static #state = {
    task: {
      id: "",
      title: "",
      description: "",
      // subtasks: [{ id: "", title: "", isCompleted: false }]
      subtasks: []
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
  static #template() {
    const state = this.#getState();

    const ul = document.querySelector(`#${Board.prefix} ul`);
    if (!ul) throw new Error(`Missing #${Board.prefix} <ul>`);
    const columns = [...ul.children].map(
      column=> {
	const id = column.getAttribute("id");
	const h3 = column.querySelector("h3");

	if (!id) throw new Error(`Missing "id" attribute in "Column" template`);
	if (!h3) throw new Error(`Missing li id="${Column.prefix}-" <h3>`);

	const idValue = id.slice(`${Column.prefix}-`.length);
	const name    = h3.textContent?.slice(0, h3.textContent.lastIndexOf("(")).trim();

	return `<option value="${idValue}" ${idValue === state.column_id ? "selected" : ""}>${name}</option>`;
      }
    ).join("");

    const selectID = generateRandomSymbols(5);

    return `<dialog class="bg-n-000-800">
              <div class="column gap-l">
                <div class="row gap-m no-wrap main-axis-space-between cross-axis-start">
                  <h2 class="fs-900 clr-n-900-000" style="max-width: 80%">${state.task.title}</h2>
                  <button class="close-btn" aria-label="close"></button>
                </div>
                <p class="fs-300 clr-n-600">${state.task.description}</p>
                <check-list></check-list>
                <div class="column gap-sm">
                  <label class="fw-bold fs-200 clr-n-600-000" for="${selectID}">Current Status</label>
                  <select class="pad-sm fs-300 fw-medium" id="${selectID}" disabled>${columns}</select>
                </div>
                <div class="row gap-l main-axis-end">
                  <button class="fw-bold fs-300 pad-h-m clr-n-000 pad-v-sm border-radius-l bg-p-purple">Edit</button>
                  <button class="fw-bold fs-300 pad-h-m clr-n-000 pad-v-sm border-radius-l bg-p-red">Delete</button>
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

    const component = this.#create();

    insert(
      CheckList.init(
	{
	  title: "Subtasks",
	  items: task.subtasks.map(subtask => {
	    /** @type {import("./check_list_item.js").CheckListItemType} */
	    const item = { id: subtask.id, value: subtask.title, checked: subtask.isCompleted };
	    return item;
	  })
	}
      ),
      "check-list",
      component
    );

    return component;
  }

  /** @returns {Element} */
  static #create() {
    const template     = document.createElement("template");
    template.innerHTML = this.#template();
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error("Can't create \"CreateNewBoardDialog\" component");

    this.#handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   *
   * @returns {void}
   */
  static #handleEvents(component) {
    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error("Missing <button aria-label=\"close\">");
    closeDialogBtn.addEventListener("click", () => component.remove());

    const controlBtns = component.querySelectorAll("button");
    const editBtn     = controlBtns[1];
    const deleteBtn   = controlBtns[2];

    editBtn.addEventListener("click", async () => {
      const { EditTaskDialog } = await import("../components/edit_task_dialog.js");
      const dialog = EditTaskDialog.init(TaskDialog.#getState());
      document.querySelector("body")?.appendChild(dialog);
      // @ts-ignore
      dialog.showModal();
    });

    deleteBtn.addEventListener("click", async () => {
      const { DeleteTaskDialog } = await import("../components/delete_task_dialog.js");
      const dialog = DeleteTaskDialog.init(TaskDialog.#getState());
      document.querySelector("body")?.appendChild(dialog);
      // @ts-ignore
      dialog.showModal();
    });

    component.addEventListener("check-list-item:changed", async (event) => {
      /** @type {import("./task.js").SubtaskType} */
      // @ts-ignore
      const subtask = event.detail;      

      //find subtask and set previous value (what was before click)
      const subtaskElement = component.querySelector(`#${CheckListItem.prefix}-${subtask.id}`);
      if (!subtaskElement) throw new Error(`Missing <li id="${CheckListItem.prefix}-${subtask.id}">`);
      const input        = subtaskElement.querySelector("input");
      const listSubtasks = subtaskElement.closest("ul");
      if (!input)        throw new Error(`Missing <input>`);
      if (!listSubtasks) throw new Error(`Missing <ul>`);

      const checkList = listSubtasks.parentElement;
      if (!checkList) throw new Error(`Can't find parent element for <ul>`);

      // set the same status what was before checkbox click
      // if will be fetch error than status of the checkbox will be the same
      input.checked = !subtask.isCompleted;      
      
      if (globalThis.role === "anonymous") {
	const { openAuthzDialog } = await import("./_helpers.js");
	openAuthzDialog();

	return;
      }

      const state = TaskDialog.#getState();      
      const index = state.task.subtasks.findIndex(item => item.id === subtask.id);      
      if (index === -1) throw new Error(`Can't find subtask with ${subtask.id} ID">`);

      state.task.subtasks[index].isCompleted = subtask.isCompleted;

      const url     = "http://localhost:4000/rpc/update_task";
      const options = {
	method: "POST",
	headers: {
	  "Content-Type": "application/json",
	  "Authorization": `Bearer ${ localStorage.getItem("bearer") }`,
	},
	body: JSON.stringify({
	  p_task:      state.task,
	  p_column_id: state.column_id
	}),
      };
      // [Errors 401, 403] [Success 200]
      let response = await fetch(url, options);

      if (response.status === 401) {
	// [Errors 400, 401, 500] [Success 201]
	const resAuthz = await fetch("http://localhost:3000/api/generate_authz_token", { method: "POST" });
	if (resAuthz.status === 401) {
	  const { openRedirectDialog } = await import("./_helpers.js");
	  openRedirectDialog();

	  return;
	}

	if (resAuthz.status !== 201) {
	  const { PopUp } = await import("../../_shared/components/pop_up.js");
	  document.body.appendChild(
	    PopUp.init({ title: "Authentication token error", message: "Something went wrong. Try again." })
	  );

	  return;
	}

	localStorage.setItem("bearer", await resAuthz.json());
	options.headers.Authorization = `Bearer ${ localStorage.getItem("bearer") }`;
	response = await fetch(url, options);
      }

      if (response.status !== 200) {
	const { PopUp } = await import("../../_shared/components/pop_up.js");
	document.body.appendChild(
	  PopUp.init({ title: "Server error", message: "Something went wrong. Try again." })
	);

	return;
      }

      const receivingTaskData = await response.json();

      // @ts-ignore
      input.checked = event.detail.isCompleted; // change checkbox status (if success)
      TaskDialog.#setState({ task: receivingTaskData, column_id: state.column_id}); // set a new state

      const selectedColumn = document.querySelector(`#${Column.prefix}-${state.column_id}`);
      if (!selectedColumn) throw new Error(`Can't find <li id="${state.column_id}">`);

      const { emit } = await import("./_helpers.js");
      // update Task component (change the number of completed subtasks)
      emit("task:updated", receivingTaskData, selectedColumn);
      // update "title" of the CheckList component (change the number of completed subtasks)
      emit("check-list-item:changed", {}, checkList);
    });
  }
}
