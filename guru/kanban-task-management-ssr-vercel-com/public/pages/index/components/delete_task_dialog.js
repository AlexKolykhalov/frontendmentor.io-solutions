// @ts-check

import { BoardsList } from "./boards_list.js";
import { BoardsListItem } from "./boards_list_item.js";
import { MainHeader } from "./main_header.js";
import { emit } from "./helpers.js";

export class DeleteTaskDialog {

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
    return `<dialog class="bg-n-000-800">
              <div class="column gap-l">
                <div class="row gap-m main-axis-space-between">
                  <h2 class="fs-900 clr-n-900-000">Delete this task?</h2>
                  <button class="close-btn" aria-label="close"></button>
                </div>
                <p class="fs-300 clr-n-600">Are you sure you want to delete the <strong class="clr-n-900-000">"${this.#getState().task.title}"</strong> task and its subtasks? This action cannot be reversed.</p>
                <div class="row gap-l main-axis-end">
                  <button class="fw-bold fs-300 pad-h-m clr-n-000 pad-v-sm border-radius-l bg-p-red">Delete</button>
                </div>
              </div>
            </dialog>`;
  }

  /**
   * @param { {task:import("./task.js").TaskType, column_id:string} } dataTask
   *
   * @returns { Element }
   */
  static init(dataTask) {
    this.#setState(dataTask);
    return DeleteTaskDialog.#create();
  }

  /** @returns { Element } */
  static #create() {
    const template     = document.createElement("template");
    template.innerHTML = DeleteTaskDialog.template();
    const component    = template.content.firstElementChild;
    if (!component) throw new Error("Can't create \"EditBoardDialog\" component");

    DeleteTaskDialog.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static handleEvents(component) {
    // delete btn
    component.querySelectorAll("button")[1].addEventListener("click", async function() {
      const state = DeleteTaskDialog.#getState();

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

      // close all opened dialogs
      document.querySelectorAll("dialog").forEach(dialog => dialog.remove());
    });

    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error("Can't find <button aria-label=\"close\">");
    closeDialogBtn.addEventListener("click", () => component.remove());
  }
}
