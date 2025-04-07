// @ts-check

import { Board }        from "./board.js";
import { DynamicList }  from "./dynamic_list.js";
import { addColumnData, getCurrentBoardId, emit, insert } from "./helpers.js";

export class AddNewColumnDialog {
  /** @returns {string} HTML string */
  static template() {
    return `<dialog>
              <div class="column gap-l">
                <div class="row gap-m main-axis-space-between">
                  <h2>Add new column</h2>
                  <button aria-label="close"><img src="/images/svg/icon-cross.svg" alt=""></button>
                </div>
                <div class="column">
                  <label for="column_name">Column Name</label>
                  <input id="column_name" placeholder="e.g. TODO">
                </div>
                <dynamic-list></dynamic-list>
                <button>Create Column</button>
              </div>
            </dialog>`;
  }

  /** @returns {Element} */
  static init() {
    const component = AddNewColumnDialog.#create();
    insert(
      DynamicList.init({
	title: "Tasks",
	items: [],
	btnText: "+ Add New Task",
	limit: 10
      }),
      "dynamic-list",
      component
    );

    return component;
  }

  /**
   * @returns {Element}
   */
  static #create() {
    const template     = document.createElement("template");
    template.innerHTML = AddNewColumnDialog.template();
    const component    = template.content.firstElementChild;
    if (!component) throw new Error("Can't create \"AddNewBoardDialog\" component");

    AddNewColumnDialog.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static handleEvents(component) {
    const input = component.querySelector("#column_name");
    if (!input) throw new Error("Can't find <input id=\"column_name\">");
    input.addEventListener("input", function() { this.removeAttribute("style"); });

    const createNewColumnBtn = component.querySelector("dynamic-list + button");
    if (!createNewColumnBtn) throw new Error("Can't find <dinamic-list> + <button>");
    createNewColumnBtn.addEventListener("click", async function() {
      if (!AddNewColumnDialog.#validation(component)) return;

      const board           = document.querySelector(`[id^="${Board.prefix}-"]`);
      const inputColumnName = component.querySelector("#column_name");
      const listOfTasks     = component.querySelector("ul");
      if (!board)           throw new Error(`Can't find <section id="${Board.prefix}-">`);
      if (!inputColumnName) throw new Error("Can't find <input id=\"column_name\">");
      if (!listOfTasks)     throw new Error("Can't find <ul>");

      try {
	const response = await fetch("/api/column", {
	  method: "POST",
	  headers: {"Content-Type": "application/json"},
	  body: JSON.stringify({
	    board_id: board.getAttribute("id")?.slice(`${Board.prefix}-`.length),
	    column: {
              name: inputColumnName.value.trim(),
              tasks: [...listOfTasks.children].map(item => {
		return {
		  title: item.querySelector("input")?.value.trim() ?? "",
		  description: "",
		  subtasks: []
		};
              })
	    }
	  }),
	});
	if (response.status === 201) {
	  const data = await response.json();
	  // update global variable
	  addColumnData(getCurrentBoardId(), data);
	  emit("column:create", data, board);
	  component.remove();
	} else {
	  const error = await response.json();
	  console.log("DB ERROR: column creation", error);
	}
      } catch (error) {
	console.log("Internet error connection", error);
      }
    });

    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error("Can't find <button aria-label=\"close\">");
    closeDialogBtn.addEventListener("click", () => component.remove());
  }

  /**
   * @param {Element} component
   * @returns {boolean}
   */
  static #validation(component) {
    const inputColumnName  = component.querySelector("#column_name");
    const boardsOfTasks = component.querySelector("ul");

    if (!inputColumnName) throw new Error("Can't find <input id=\"column_name\">");
    if (!boardsOfTasks) throw new Error("Can't find <ul>");

    let isValid = true;

    // @ts-ignore
    if (!inputColumnName.value.trim()) { // input (must not be empty)
      inputColumnName.setAttribute("style", "border-color: red;");
      isValid = false;
    }

    [...boardsOfTasks.children].forEach((item) => {
      if (!item.querySelector("input")?.value.trim()) { // task must not be empty
	item.querySelector("input")?.setAttribute("style", "border-color: red;");
	isValid = false;
      }
    });

    return isValid;
  }
}
