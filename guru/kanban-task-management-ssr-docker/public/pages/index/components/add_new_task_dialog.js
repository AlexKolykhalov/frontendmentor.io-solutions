// @ts-check

import { Board }                            from "./board.js";
import { Column }                           from "./column.js";
import { DynamicList }                      from "./dynamic_list.js";
import { emit, insert, openRedirectDialog } from "./_helpers.js";

export class AddNewTaskDialog {
  /** @returns {string} HTML string */
  static #template() {
    const ul = document.querySelector(`#${Board.prefix} ul`);
    if (!ul) throw new Error(`Missing #${Board.prefix} <ul>`);

    const options = [...ul.children].map(
      (column, index) => {
	const id = column.getAttribute("id");
	const h3 = column.querySelector("h3");

	if (!id) throw new Error(`Missing "id" attribute in "Column" template`);
	if (!h3) throw new Error(`Missing li id="${Column.prefix}-" <h3>`);

	const idValue = id.slice(`${Column.prefix}-`.length);
	const name    = h3.textContent?.slice(0, h3.textContent.lastIndexOf("(") - 1);

	return `<option value="${idValue}" ${index === 0 ? "selected" : ""}>${name}</option>`;
      }
    ).join("");

    return `<dialog class="bg-n-000-800">
              <div class="column gap-l">
                <div class="row gap-m main-axis-space-between">
                  <h2 class="fs-900 clr-n-900-000">Add new task</h2>
                  <button class="close-btn" aria-label="close"></button>
                </div>
                <div class="column gap-sm fs-300 fw-medium">
                  <label class="clr-n-600-000" for="task_name">Task Name</label>
                  <input class="pad-sm clr-n-900-000 bg-n-100-900" id="task_name" placeholder="e.g. Take a break">
                </div>
                <div class="column gap-sm fs-300 fw-medium">
                  <label class="clr-n-600-000" for="task_description">Description</label>
                  <textarea class="pad-sm clr-n-900-000 bg-n-100-900" id="task_description" maxlength="300" cols="30" rows="6" style="resize:none;"></textarea>
                </div>
                <dynamic-list></dynamic-list>
                <div class="column gap-sm">
                  <label class="fw-bold fs-200 clr-n-600-000" for="current_status">Current Status</label>
                  <select class="pad-sm fs-300 fw-medium clr-n-900-000 bg-n-100-900" id="current_status">${options}</select>
                </div>
                <button class="[ relative ] fw-bold fs-300 pad-h-m clr-n-000 pad-v-sm border-radius-l bg-p-purple">Create Task</button>
              </div>
            </dialog>`;
  }

  /** @returns {Element} */
  static init() {
    const component = this.#create();

    insert(
      DynamicList.init(
	{
	  title: "Subtasks",	  
	  items: [],
	  btnText: "+ Add New Subtask",
	  min: 0,
	  max: 8
	}
      ),
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
    const input = component.querySelector("#task_name");
    if (!input) throw new Error(`Can't find <input id="task_name">`);
    input.addEventListener("input", function() { this.removeAttribute("style"); });

    const select = component.querySelector("#current_status");
    if (!select) throw new Error(`Missing <select id="current_status">`);
    select.addEventListener("input", function () {
      select.querySelector("option[selected]")?.removeAttribute("selected");
      // @ts-ignore
      const elem = [...select.children].find(item => item.value === select.value);
      elem?.setAttribute("selected", "");
    });

    const createNewTaskBtn = component.querySelector(`dynamic-list + div + button`);
    if (!createNewTaskBtn) throw new Error(`Can't find "Create Task" button`);
    createNewTaskBtn.addEventListener("click", async function() {

      if (!validation()) return;

      /** @type {HTMLInputElement|null} */
      const taskName     = component.querySelector("#task_name");
      /** @type {HTMLInputElement|null} */
      const description  = component.querySelector("#task_description");
      const subtasksList = component.querySelector("ul");
      const select       = component.querySelector("select"); // contains column id

      if (!taskName)     throw new Error("Can't find <input id=\"task_name\">");
      if (!description)  throw new Error("Can't find <textarea id=\"task_description\">");
      if (!subtasksList) throw new Error("Can't find <ul>");
      if (!select)       throw new Error("Can't find <select>");

      const selectedColumn = document.querySelector(`#${Column.prefix}-${select.value}`);
      if (!selectedColumn) throw new Error(`Can't find <li id="${select.value}">`);

      /** @type {import("./task.js").TaskType} */
      const task = {	
	id: "",
	title: taskName.value.trim(),
	description: description.value.trim(),
	subtasks: [...subtasksList.children].map(
	  item => {
	    const input = item.querySelector("input");
	    if (!input) throw new Error("Missing <input>");

	    return { id: "", title: input.value.trim(), isCompleted: false };
	  }
	)
      };

      console.log(task);
      
      if (globalThis.role === "anonymous") {
	task.id = crypto.randomUUID();
	emit("task:created", task, selectedColumn);

	component.remove();

	return;
      }

      this.setAttribute("disabled", "");
      // add indicator
      const { LoaderRipple } = await import("../../_shared/components/loader_ripple.js");
      const loader = LoaderRipple.init();
      loader.classList.add("clr-n-000");
      loader.setAttribute("style", "--size: 25px; right: 5%;");
      this.appendChild(loader);

      const url     = "http://localhost:4000/rpc/create_task";
      const options = {
	method: "POST",
	headers: {
	  "Content-Type": "application/json",
	  "Authorization": `Bearer ${ localStorage.getItem("bearer") }`,
	},
	body: JSON.stringify({
	  p_task: task,
	  p_column_id: select.value
	}),
      };
      // [Errors 400, 401, 403] [Success 200]
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

      emit("task:created", await response.json(), selectedColumn);

      component.remove();
    });

    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error("Can't find <button aria-label=\"close\">");
    closeDialogBtn.addEventListener("click", () => component.remove());

    // *** ADDITIONAL FUNCTIONS ***

    /** @returns {boolean} */
    function validation() {
      const inputTaskName = component.querySelector("#task_name");
      const subtasksList  = component.querySelector("ul");

      if (!inputTaskName) throw new Error("Can't find <input id=\"task_name\">");
      if (!subtasksList)  throw new Error("Can't find <ul>");

      let isValid = true;

      // @ts-ignore
      if (!inputTaskName.value.trim()) { // task name must not be empty
	inputTaskName.setAttribute("style", "border-color: red;");
	isValid = false;
      }

      [...subtasksList.children].forEach((item) => {
	if (!item.querySelector("input")?.value.trim()) { // subtask must not be empty
	  item.querySelector("input")?.setAttribute("style", "border-color: red;");
	  isValid = false;
	}
      });

      return isValid;
    }
  }
}
