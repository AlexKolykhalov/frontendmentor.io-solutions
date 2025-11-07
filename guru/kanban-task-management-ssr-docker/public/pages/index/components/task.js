// @ts-check

/**
 * @typedef {Object} SubtaskType
 * @property {string}  id
 * @property {string}  title
 * @property {boolean} isCompleted
 */

/**
 * @typedef {Object} TaskType
 * @property {string}        id
 * @property {string}        title
 * @property {string}        description
 * @property {SubtaskType[]} subtasks
 */

/**
 * @typedef {Object} TaskComponentType
 * @property {TaskType} task
 * @property {boolean}  [locked] By default "false".
 */

export class Task {

  static prefix   = "task"; // using in column.js
  static selector = `[id^=${this.prefix}-]`;  

  /**
   * @param {TaskComponentType} props
   *
   * @returns {string} HTML string
   */
  static template(props) {

    const isSSR = typeof window === "undefined" && typeof document === "undefined";
    const classes    = props.locked ? "[ relative ] task-item" : "task-item";
    const lockedAttr = props.locked ? `data-locked="true"`: "";
    const lockedImg  = props.locked ?
	  `<img class="absolute" src="images/svg/icon-locked.svg" alt="" width="16" height="16" style="top: 7px; right: 7px;">`:
	  "";
    const path = isSSR ? `data-path="http://localhost:3000/pages/index/components/task.js"` : "";
    
    return `<li id="${this.prefix}-${props.task.id}" class="${classes}" draggable="true" ${lockedAttr} ${path}}>
              <p class="fw-bold">${props.task.title}</p>
              <p class="fs-200 fw-bold clr-n-600">${props.task.subtasks.filter(item => item.isCompleted).length} of ${props.task.subtasks.length} Subtasks</p>
              ${lockedImg}
            </li>`;
  }

  /**
   * @param {TaskComponentType} props
   *
   * @returns {Element}
   */
  static init(props) {
    return this.#create(props);
  }  

  /**
   * @param {TaskComponentType} props
   *
   * @returns {Element}
   */
  static #create(props) {
    const template     = document.createElement("template");
    template.innerHTML = this.template(props);
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error("Can't create \"Task\" component");

    this.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   *
   * @returns {void}
   */
  static handleEvents(component) {
    // @ts-ignore
    const isLocked = component.dataset.locked === "true"; delete component.dataset.locked;
    
    if (isLocked) component.addEventListener("click", async () => {
      const { openAuthzDialog } = await import("./_helpers.js");
      openAuthzDialog();
    });
    
    if (!isLocked) {
      component.addEventListener("click", async () => {
	const id      = component.getAttribute("id")?.slice(`${Task.prefix}-`.length);
	const url     = `http://localhost:4000/rpc/get_task?p_task_id=${id}`;
	const options = {
	  headers: {
	    "Accept":         "application/vnd.pgrst.object+json",
	    "Accept-Profile": "api",
	    "Authorization":  `Bearer ${ localStorage.getItem("bearer") }`,
	  }
	};
	// [Errors 401, 403, 404] [Success 200]
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
	      PopUp.init({
		title:   "Authentication token error",
		message: "Something went wrong. Try again."
	      })
	    );	    

	    return;
	  }

	  localStorage.setItem("bearer", await resAuthz.json());
	  options.headers.Authorization = `Bearer ${ localStorage.getItem("bearer") }`;
	  response = await fetch(url, options);
	};
	
	if (response.status !== 200) {
	  const { PopUp } = await import("../../_shared/components/pop_up.js");
	  document.body.appendChild(
	    PopUp.init({ title: "Server error", message: "Something went wrong. Try again." })
	  );	  

	  return;
	}

	const { TaskDialog } = await import("../components/task_dialog.js");
	const dialog = TaskDialog.init(await response.json());
	document.querySelector("body")?.appendChild(dialog);
	// @ts-ignore
	dialog.showModal();
      });  
    }

    // @ts-ignore // dragover & drop see in column.js
    component.addEventListener("dragstart", (e) => e.target?.classList.add("moving"));
  }
}

