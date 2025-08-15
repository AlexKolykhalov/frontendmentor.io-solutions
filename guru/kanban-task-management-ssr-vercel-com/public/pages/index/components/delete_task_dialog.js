// @ts-check

import { Role, roles } from "../../_shared/roles.js";
import { emit, openRedirectDialog } from "./_helpers.js";

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
  static #template() {
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
    
    return this.#create();
  }

  /** @returns { Element } */
  static #create() {
    const template     = document.createElement("template");
    template.innerHTML = this.#template();
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error("Can't create \"EditBoardDialog\" component");

    this.#handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static #handleEvents(component) {
    // delete btn
    component.querySelectorAll("button")[1].addEventListener("click", async function() {
      const state = DeleteTaskDialog.#getState();
      const selectedColumn = document.querySelector(`#column-${state.column_id}`);
      if (!selectedColumn) throw new Error(`Can't find <li id="${state.column_id}">`);

      if (Role.getRole() === roles.ANONYMOUS) {
	emit("task:deleted", { id: state.task.id }, selectedColumn);

	// close all opened dialogs
	document.querySelectorAll("dialog").forEach(dialog => dialog.remove());

	return;
      }

      const url     = "http://localhost:4000/rpc/delete_task";
      const options = {
	method: "POST",
	headers: {
	  "Content-Type": "application/json",
	  "Authorization": `Bearer ${ localStorage.getItem("bearer") }`,
	},
	body: JSON.stringify({ p_id: state.task.id }),
      };
      // [Errors 401, 403] [Success 204]
      let response = await fetch(url, options);

      if (response.status === 401) {
	const resAuthz = await fetch("http://localhost:3000/api/generate_authz_token", { method: "POST" });
	if (resAuthz.status === 401) {
	  await openRedirectDialog();

	  return;
	}

	if (resAuthz.status !== 201) throw new Error("Get generate_authz_token error");

	localStorage.setItem("bearer", await resAuthz.json());
	options.headers.Authorization = `Bearer ${ localStorage.getItem("bearer") }`;
	response = await fetch(url, options);	
      }
      
      if (response.status !== 204 && response.status !== 403)
	throw new Error("Unexpected response status");

      emit("task:deleted", { id: state.task.id }, selectedColumn);

      // close all opened dialogs
      document.querySelectorAll("dialog").forEach(dialog => dialog.remove());
    });

    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error("Can't find <button aria-label=\"close\">");
    closeDialogBtn.addEventListener("click", () => component.remove());
  }
}
