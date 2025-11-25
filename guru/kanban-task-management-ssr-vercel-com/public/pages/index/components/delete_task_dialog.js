// @ts-check

export class DeleteTaskDialog {

  /** @type {import("./task.js").TaskType} */
  static #state = {
    id: "",
    title: "",
    description: "",
    subtasks: [{ id: "", title: "", isCompleted: false }]
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
    return `<dialog class="bg-n-000-800">
              <div class="column gap-l">
                <div class="row gap-m main-axis-space-between">
                  <h2 class="fs-900 clr-n-900-000">Delete this task?</h2>
                  <button class="close-btn" aria-label="close"></button>
                </div>
                <p class="fs-300 clr-n-600">Are you sure you want to delete the <strong class="clr-n-900-000">"${this.#getState().title}"</strong> task and its subtasks? This action cannot be reversed.</p>
                <div class="row gap-l main-axis-end">
                  <button class="[ relative ] fw-bold fs-300 pad-h-l clr-n-000 pad-v-sm border-radius-l bg-p-red">Delete</button>
                </div>
              </div>
            </dialog>`;
  }

  /**
   * @param {import("./task.js").TaskType} task
   * @returns { Element }
   */
  static init(task) {
    this.#setState(task);

    return this.#create();
  }

  /** @returns { Element } */
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
    // delete btn
    component.querySelectorAll("button")[1].addEventListener("click", async function() {
      const { Column } = await import("./column.js");
      const task   = DeleteTaskDialog.#getState();
      const column = document.querySelector(`[data-id="${task.id}"]`)?.closest(`[data-prefix="${Column.prefix}"]`);
      if (!column) throw new Error(`Column with Task [data-id="${task.id}"] is missing`);
      
      if (globalThis.client_variables.is_anonymous) {
	document.querySelectorAll("dialog").forEach(dialog => dialog.remove()); // close all opened dialogs
	column.dispatchEvent(new CustomEvent("task:deleted", { detail: task.id }));

	return;
      }
      
      this.setAttribute("disabled", ""); // disable deleteBtn
      
      // add indicator
      const { LoaderRipple } = await import("../../_shared/components/loader_ripple.js");
      const loader = LoaderRipple.init();
      loader.classList.add("clr-n-000");
      loader.setAttribute("style", "--size: 25px; right: 5%;");
      this.appendChild(loader);

      const url     = `/v1/tasks/${task.id}`;
      const options = { method: "DELETE" };
      
      // [Errors 401, 403, 404, 405, 500] [Success 204]
      const response = await fetch(url, options);

      if (response.status === 401 || response.status === 403) {
	document.querySelectorAll("dialog").forEach(dialog => dialog.remove()); // close all opened dialogs
	if (response.status === 401) {
	  const { openAuthzDialog } = await import("../functions.js");
	  await openAuthzDialog();
	}

	if (response.status === 403) {
	  const { openSessionExpiredDialog } = await import("../functions.js");
	  await openSessionExpiredDialog();
	}
	
	return;
      }

      if (response.status === 404 || response.status !== 204) {
	document.querySelectorAll("dialog").forEach(dialog => dialog.remove()); // close all opened dialogs
	const { openPopUp } = await import("../../_shared/functions.js");
	await openPopUp(
	  response.status === 404 ? "Search error" : "Server error",
	  response.status === 404 ? "Task not found" : "Something went wrong. Try again"
	)

	return;
      }
      
      document.querySelectorAll("dialog").forEach(dialog => dialog.remove()); // close all opened dialogs
      column.dispatchEvent(new CustomEvent("task:deleted", { detail: task.id }));
    });

    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error(`<button aria-label="close"> is missing`);
    closeDialogBtn.addEventListener("click", () => component.remove());
  }
}
