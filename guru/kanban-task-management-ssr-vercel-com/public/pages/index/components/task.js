// @ts-check

/**
 * @typedef {Object} SubtaskType
 * @property {string} id
 * @property {string} title
 * @property {boolean} isCompleted
 */

/**
 * @typedef {Object} TaskType
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {SubtaskType[]} subtasks
 */

export class Task {

  static prefix = "task";

  /**
   * @param {TaskType} task
   * @returns {string} HTML string
   */
  static template(task) {
    return `<li id="${this.prefix}-${task.id}" class="task-item" draggable="true">
              <p class="fw-bold">${task.title}</p>
              <p class="fs-200 fw-bold clr-n-600">${task.subtasks.filter(item => item.isCompleted).length} of ${task.subtasks.length} Subtasks</p>
            </li>`;
  }

  /**
   * @param {TaskType} task
   * @returns {Element}
   */
  static init(task) {
    return Task.#create(task);
  }

  /**
   * @param {TaskType} task
   * @returns {Element}
   */
  static #create(task) {
    const template     = document.createElement("template");
    template.innerHTML = Task.template(task);
    const component    = template.content.firstElementChild;
    if (!component) throw new Error("Can't create \"Task\" component");

    Task.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static handleEvents(component) {
    component.addEventListener("click", async () => {
      const t   = `id:task_id,title,description`;
      const sub = `id:subtask_id,title,isCompleted:is_completed`;
      const select = `${t},subtasks(${sub})`;
      const id = component.getAttribute("id")?.slice(`${Task.prefix}-`.length);

      const response = await fetch(
	`http://localhost:4000/tasks?select=${select}&task_id=eq.${id}`,
	{ headers:{ "Accept": "application/vnd.pgrst.object+json" } }
      );

      if (response.status === 401) throw new Error("Authentication error");
      if (response.status !== 200) throw new Error("Unexpected response status");

      const { TaskDialog } = await import("../components/task_dialog.js");
      const dialog = TaskDialog.init(await response.json());
      document.querySelector("body")?.appendChild(dialog);
      // @ts-ignore
      dialog.showModal();
    });
    // @ts-ignore
    component.addEventListener("dragstart", (e) => e.target?.classList.add("moving"));
  }
}

