// @ts-check

import { Board }                 from "./board.js";
import { Column }                from "./column.js";
import { CheckList }             from "./check_list.js";
import { generateRandomSymbols } from "../functions.js";

export class TaskDialog {
  /** @type {import("./task.js").TaskType} */
  static #state = {
    id: "",
    title: "",
    description: "",
    subtasks: []
  };

  /** @returns {import("./task.js").TaskType} */
  static #getState() {
    return JSON.parse(JSON.stringify(this.#state));
  }

  /** @param {import("./task.js").TaskType} value */
  static #setState(value) {
    this.#state = value;
  }

  /** @returns {string} HTML string */
  static #template() {
    const task        = this.#getState();
    const columnID    = document.querySelector(`[data-id="${task.id}"]`)?.closest(`[data-prefix="${Column.prefix}"]`)?.getAttribute("data-id");
    const columnsList = document.querySelector(`[data-prefix="${Board.prefix}"] ul`);
    if (!columnsList) throw new Error(`[data-prefix="${Board.prefix}"] <ul> is missing`);
    if (!columnID)    throw new Error(`[data-prefix="${Column.prefix}"] is missing`);

    const options = [...columnsList.children].map(
      column=> {
	const h3 = column.querySelector("h3");
	const id = column.getAttribute("data-id");
	if (!id) throw new Error(`[data-prefix="${Column.prefix}"] [data-id] is missing`);
	if (!h3) throw new Error(`[data-prefix="${Column.prefix}"] <h3> is missing`);

	const name = h3.textContent?.slice(0, h3.textContent.lastIndexOf("(")).trim();

	return `<option value="${id}" ${id === columnID ? "selected" : ""}>${name}</option>`;
      }
    ).join("");

    const selectID = generateRandomSymbols(5);

    return `<dialog class="bg-n-000-800">
              <div class="column gap-l">
                <div class="row gap-m no-wrap main-axis-space-between cross-axis-start">
                  <h2 class="fs-900 clr-n-900-000" style="max-width: 80%">${task.title}</h2>
                  <button class="close-btn" aria-label="close"></button>
                </div>
                <p class="fs-300 clr-n-600">${task.description}</p>
                <check-list></check-list>
                <div class="column gap-sm">
                  <label class="fw-bold fs-200 clr-n-600-000" for="${selectID}">Current Status</label>
                  <select class="pad-sm fs-300 fw-medium" id="${selectID}" disabled>${options}</select>
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
   * @returns {Element}
   */
  static init(task) {
    this.#setState(task);
    const component = this.#create();
    const checkList = component.querySelector("check-list");
    if (!checkList) throw new Error("<check-list> is missing");

    checkList.replaceWith(
      CheckList.init(
	{
	  title: "Subtasks",
	  items: task.subtasks.map(subtask => {
	    /** @type {import("./check_list_item.js").CheckListItemType} */
	    const item = { id: subtask.id, value: subtask.title, checked: subtask.isCompleted };
	    return item;
	  })
	}
      )
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
    const editBtn     = controlBtns[1];
    const deleteBtn   = controlBtns[2];

    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error(`<button aria-label="close"> is missing`);
    closeDialogBtn.addEventListener("click", () => component.remove());

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

    // *** ADDITIONAL LISTENERS ***

    component.addEventListener("check-list-item:changed", (event) => {
      // @ts-ignore
      const updatedSubtask = event.detail;
      const task = this.#getState();
      const column = document.querySelector(`[data-id="${task.id}"]`)?.closest(`[data-prefix="${Column.prefix}"]`);
      if (!column) throw new Error(`Column containing the Task [data-id="${task.id}"] is missing`);

      const subtask = task.subtasks.find(item => item.id === updatedSubtask.id);
      if (!subtask) throw new Error(`${updatedSubtask.id} subtask is missing`);

      subtask.isCompleted = updatedSubtask.isCompleted;
      column.dispatchEvent(new CustomEvent("task:updated", { detail: task }));

      this.#setState(task);
    });

    component.addEventListener("check-list-item:error", () => {
      component.remove()
    });
  }
}
