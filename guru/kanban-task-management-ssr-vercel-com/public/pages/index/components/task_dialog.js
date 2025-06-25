// @ts-check

import { Board }         from "./board.js";
import { Column }        from "./column.js";
import { CheckList }     from "./check_list.js";
import { Task }          from "./task.js";
import { emit, insert }  from "./helpers.js";
import { CheckListItem } from "./check_list_item.js";

export class TaskDialog {

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

    const state = TaskDialog.#getState();

    const ul = document.querySelector(`#${Board.prefix} ul`);
    if (!ul) throw new Error(`Missing #${Board.prefix} <ul>`);
    const columns = [...ul.children].map(
      column=> {
	const id = column.getAttribute("id");
	const h3 = column.querySelector("h3");

	if (!id) throw new Error(`Missing "id" attribute in "Column" template`);
	if (!h3) throw new Error(`Missing li id="${Column.prefix}-" <h3>`);

	const idValue = id.slice(`${Column.prefix}-`.length);
	const name    = h3.textContent?.slice(0, h3.textContent.lastIndexOf("("));

	return `<option value="${idValue}" ${idValue === state.column_id ? "selected" : ""}>${name}</option>`;
      }
    ).join("");

    return `<dialog>
              <div class="column gap-l">
                <div class="row gap-m main-axis-space-between">
                  <h2>${state.task.title}</h2>
                  <button aria-label="close"><img src="/images/svg/icon-cross.svg" alt=""></button>
                </div>
                <p>${state.task.description}</p>
                <check-list></check-list>
                <div class="column">
                  <label for="current_status">Current Status</label>
                  <select id="current_status" disabled>${columns}</select>
                </div>
                <div class="column gap-sm">
                  <button>Edit</button>
                  <button>Delete</button>
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

    const component = TaskDialog.#create();

    /** @type {import("./check_list_item.js").CheckListItemType[]} */
    const checkListItems = task.subtasks.map(subtask => {
      return { id: subtask.id, title: subtask.title, checked: subtask.isCompleted };
    });

    insert(
      CheckList.init({ title: "Subtasks", items: checkListItems }),
      "check-list",
      component
    );

    return component;
  }

  /** @returns {Element} */
  static #create() {
    const template     = document.createElement("template");
    template.innerHTML = TaskDialog.template();
    const component    = template.content.firstElementChild;
    if (!component) throw new Error("Can't create \"CreateNewBoardDialog\" component");

    TaskDialog.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   *
   * @returns {void}
   */
  static handleEvents(component) {
    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error("Missing <button aria-label=\"close\">");
    closeDialogBtn.addEventListener("click", () => component.remove());

    const controlBtns = component.querySelectorAll("button");
    const editBtn     = controlBtns[1];
    const deleteBtn   = controlBtns[2];

    editBtn.addEventListener("click", async () => {
      const { EditTaskDialog } = await import("../components/edit_task_dialog.js");
      const dialog = EditTaskDialog.init(TaskDialog.#getState().task);
      document.querySelector("body")?.appendChild(dialog);
      // @ts-ignore
      dialog.showModal();

      component.remove();
    });

    deleteBtn.addEventListener("click", async () => {
      const state = TaskDialog.#getState();

      const response = await fetch(
	`http://localhost:4000/rpc/delete_task`,
	{
	  method: "POST",
	  headers: {
	    "Content-Type": "application/json",
	    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYXV0aF91c2VyIn0.XC5n_hafVOMV1Ve7S2_5A0K5TmWURd_Q-zsoZgBFUTo",
	  },
	  body: JSON.stringify({ p_id: state.task.id }),
	}
      );

      if (response.status === 401) throw new Error("Authentication error");
      if (response.status !== 204) throw new Error("Unexpected response status");

      const selectedColumn = document.querySelector(`#column-${state.column_id}`);
      if (!selectedColumn) throw new Error(`Can't find <li id="${state.column_id}">`);

      emit("task:deleted", { id: state.task.id }, selectedColumn);

      component.remove();
    });

    component.addEventListener("check-list-item:change", async (event) => {
      //find subtask and set previous value (what was before click)
      // @ts-ignore
      const subtask = component.querySelector(`#${CheckListItem.prefix}-${event.detail.id}`);
      // @ts-ignore
      if (!subtask) throw new Error(`Missing <li id="${CheckListItem.prefix}-${event.detail.id}">`);
      const input        = subtask.querySelector("input");
      const listSubtasks = subtask.closest("ul");
      if (!input)        throw new Error(`Missing <input>`);      
      if (!listSubtasks) throw new Error(`Missing <ul>`);

      const checkList = listSubtasks.parentElement;
      if (!checkList) throw new Error(`Can't find parent element for <ul>`);

      
      // set the same status what was before checkbox click
      // if will be fetch error than status of the checkbox will be the same
      // @ts-ignore
      input.checked = !event.detail.isCompleted;

      const state = TaskDialog.#getState();
      // @ts-ignore
      const index = state.task.subtasks.findIndex(subtask => subtask.id === event.detail.id);
      // @ts-ignore
      if (index === -1) throw new Error(`Can't find subtask with ${event.detail.id} ID">`);

      // @ts-ignore
      state.task.subtasks[index].isCompleted = event.detail.isCompleted;

      const response = await fetch(
	`http://localhost:4000/rpc/update_task`,
	{
	  method: "POST",
	  headers: {
	    "Content-Type": "application/json",
	    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYXV0aF91c2VyIn0.XC5n_hafVOMV1Ve7S2_5A0K5TmWURd_Q-zsoZgBFUTo",
	  },
	  body: JSON.stringify({ p_task: state.task, p_column_id: state.column_id }),
	}
      );

      if (response.status === 401) throw new Error("Authentication error");
      if (response.status !== 200) throw new Error("Unexpected response status");

      const receivingTaskData = await response.json();

      // @ts-ignore
      input.checked = event.detail.isCompleted; // change checkbox status (if success)
      TaskDialog.#setState({ task: receivingTaskData, column_id: state.column_id}); // set a new state

      const selectedColumn = document.querySelector(`#column-${state.column_id}`);
      if (!selectedColumn) throw new Error(`Can't find <li id="${state.column_id}">`);

      // update Task component
      emit("task:updated", receivingTaskData, selectedColumn);
      // update title of the CheckList component
      emit("check-list-item:change", {}, checkList);
    });
  }
}
