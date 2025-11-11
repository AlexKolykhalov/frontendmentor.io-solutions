// @ts-check

/**
 * @typedef  {Object}  SubtaskType
 * @property {string}  id
 * @property {string}  title
 * @property {boolean} isCompleted
 */

/**
 * @typedef  {Object}        TaskType
 * @property {string}        id
 * @property {string}        title
 * @property {string}        description
 * @property {SubtaskType[]} subtasks
 */

/**
 * @typedef  {Object}   TaskComponentType
 * @property {TaskType} task
 * @property {boolean}  [locked] By default "false".
 */

export class Task {
  static prefix = "task"; // using in column.js

  /**
   * @param {TaskComponentType} props
   * @returns {string} HTML string
   */
  static template(props) {
    const lockedImg = props.locked ?
	  `<img class="absolute" src="images/svg/icon-locked.svg" alt="" width="16" height="16" style="top: 7px; right: 7px;">`:
	  "";
    if (typeof window === "undefined" && typeof document === "undefined")
      globalThis.paths[this.prefix] = "/pages/index/components/task.js";

    return `<li class="[ relative ] task-item" data-prefix="${this.prefix}" data-id="${props.task.id}" ${props.locked ? "data-locked": ""} draggable="true">
              <p class="fw-bold">${props.task.title}</p>
              <p class="fs-200 fw-bold clr-n-600">${props.task.subtasks.filter(item => item.isCompleted).length} of ${props.task.subtasks.length} Subtasks</p>
              ${lockedImg}
            </li>`;
  }

  /**
   * @param {TaskComponentType} props
   * @returns {Element}
   */
  static init(props) {
    return this.#create(props);
  }

  /**
   * @param {TaskComponentType} props
   * @returns {Element}
   */
  static #create(props) {
    const template     = document.createElement("template");
    template.innerHTML = this.template(props);
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error(`Can't create ${this.name} component`);

    this.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static handleEvents(component) {
    // @ts-ignore    
    if (component.hasAttribute("data-locked")) {
      component.addEventListener("click", async () => {
	const { openAuthzDialog } = await import("../functions.js");
	openAuthzDialog();
      })

      component.removeAttribute("data-locked");
    } else {
      component.addEventListener("click", async () => {
	// disable clicks on tasks or boards list items
	if (document.querySelector(`.lds-ripple`)) return;

	// add indicator
	const { LoaderRipple } = await import("../../_shared/components/loader_ripple.js");
	const loader = LoaderRipple.init();
	loader.setAttribute("style", "top: 5%; right: 2.5%"); // customize position inside task component
	component.appendChild(loader);

	const taskID = component.getAttribute("data-id");
	if (!taskID) throw new Error("[data-id] is missing")
	
	// [Errors 401, 403, 404, 405, 500] [Success 200]
	const response = await fetch(`http://localhost:3000/v1/tasks/${taskID}`);

	if (response.status === 401 || response.status === 403) {
	  if (response.status === 401) {
	    const { openAuthzDialog } = await import("../functions.js");
	    await openAuthzDialog();
	  }

	  if (response.status === 403) {
	    const { openSessionExpiredDialog } = await import("../functions.js");
	    await openSessionExpiredDialog();
	  }
	  
	  loader.remove();

	  return;
	};

	if (response.status === 404 || response.status !== 200) {
	  const { openPopUp } = await import("../../_shared/functions.js");
	  await openPopUp(
	    response.status === 404 ? "Search error" : "Server error",
	    response.status === 404 ? "Task not found" : "Something went wrong. Try again"
	  );
	  
	  loader.remove();

	  return;
	};

	const { TaskDialog } = await import("../components/task_dialog.js");
	const dialog = TaskDialog.init(await response.json());
	document.querySelector("body")?.appendChild(dialog);
	// @ts-ignore
	dialog.showModal();

	loader.remove();
      });  
    }
    
    component.addEventListener("dragstart", (event) => { // dragover & drop see in column.js
      if (!event.target) throw new Error("Target element is missing");

      // @ts-ignore
      event.target.classList.add("moving");
    }); 
  }
}
