// @ts-check

import { Board }        from "./board.js";
import { BoardsList }   from "./boards_list.js";
import { DynamicList }  from "./dynamic_list.js";
import { emit, insert } from "./helpers.js";

export class TaskDialog {
  /**
   * @param {import("./types.js").Task} task
   * @param {Array<{id:string, title:string}>} columns
   * @returns {string} HTML string
   */
  static template(task, columns) {
    return `<dialog>
              <div class="column gap-l">
                <div class="row gap-m main-axis-space-between">
                  <h2>${task.title}</h2>
                  <button aria-label="close"><img src="/images/svg/icon-cross.svg" alt=""></button>
                </div>
                <p>${task.description}</p>
                <subtasks-list></subtasks-list>
                <div class="column">
                  <label for="current_status">Current Status</label>
                  <select id="current_status">
                    ${columns.map(column => `<option value="${column.id}">${column.title}</option>`).join("")}
                  </select>
                </div>
                <div class="row gap-m">
                  <button>Delete</button>
                  <button>Edit</button>
                  <button>Save</button>
                </div>
              </div>
            </dialog>`;
  }

  /**
   *  @param {import("./types.js").Task} task
   *  @returns {Element}
   */
  static init(task) {
    const columnsList = document.querySelector(`[id^=${Board.prefix}-] ul`);
    if (!columnsList) throw new Error(`Can't find <section id="${Board.prefix}-"> <ul>`);
    const columns = [...columnsList.children].map(column => {
      return {
	id: column.getAttribute("id") ?? "",
	title: column.querySelector("h3")?.textContent?.trim().slice(0, -4) ?? "" // foo (0)
      }                                                                           //    ^ == -4
    });
    const component = TaskDialog.#create(task, columns);
    // insert(
    //   DynamicList.init({
    // 	title: "Board Columns",
    // 	items: [{ value: "", placeholder: "e.g. TODO", disabled: true }],
    // 	btnText: "+ Add New Column",
    // 	limit: 5
    //   }),
    //   "dynamic-list",
    //   component
    // );

    return component;
  }

  /**
   * @param {import("./types.js").Task} task
   * @param {Array<{id:string, title:string}>} columns
   * @returns {Element}
   */
  static #create(task, columns) {
    const template     = document.createElement("template");
    template.innerHTML = TaskDialog.template(task, columns);
    const component    = template.content.firstElementChild;
    if (!component) throw new Error("Can't create \"CreateNewBoardDialog\" component");

    TaskDialog.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static handleEvents(component) {
    // const input = component.querySelector("#board_name");
    // if (!input) throw new Error("Can't find <input id=\"board_name\">");
    // input.addEventListener("input", function() { this.removeAttribute("style"); });

    // const createNewBoardBtn = component.querySelector("dynamic-list + button");
    // if (!createNewBoardBtn) throw new Error("Can't find <dinamic-list> + <button>");
    // createNewBoardBtn.addEventListener("click", async function() {
    //   if (!TaskDialog.#validation(component)) return;

    //   const board      = document.querySelector(`[id^="${Board.prefix}-"]`);
    //   const boardsList = document.querySelector(`[id^="${BoardsList.prefix}-"]`);
    //   if (!board)      throw new Error(`Can't find <section id="${Board.prefix}-">`);
    //   if (!boardsList) throw new Error(`Can't find <article id="${BoardsList.prefix}-">`);

    //   const inputBoardName  = component.querySelector("#board_name");
    //   const boardsOfColumns = component.querySelector("ul");

    //   if (!inputBoardName)  throw new Error("Can't find <input id=\"board_name\">");
    //   if (!boardsOfColumns) throw new Error("Can't find <ul>");

    //   /** @type {import("./types.js").Board} */
    //   const data = {
    // 	id: "",
    //     name: inputBoardName.value.trim(),
    //     columns: [...boardsOfColumns.children].map(item => {
    // 	  return {
    // 	    id: "",
    // 	    name: item.querySelector("input")?.value.trim() ?? "",
    // 	    tasks: []
    // 	  };
    //     })
    //   };

    //   try {
    // 	const response = await fetch("/api/board", {
    // 	  method: "POST",
    // 	  headers: {"Content-Type": "application/json"},
    // 	  body: JSON.stringify({
    //         name: inputBoardName.value.trim(),
    //         columns: [...boardsOfColumns.children].map(item => {
    // 	      return {
    // 		name: item.querySelector("input")?.value.trim() ?? "",
    // 		tasks: []
    // 	      };
    //         })
    // 	  }),
    // 	});
    // 	if (response.status === 201) {
    // 	  const data = await response.json();
    // 	  console.log(data);
    // 	  glob.boards.push(data); // update global variable
    // 	  emit("board:create", data, boardsList);
    // 	  emit("board:create", data, board);
    // 	} else {
    // 	  const error = await response.json();
    // 	  console.log("DB ERROR: board creation", error);
    // 	}
    //   } catch (error) {
    // 	console.log("Internet error connection", error);
    //   }

    // });

    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error("Can't find <button aria-label=\"close\">");
    closeDialogBtn.addEventListener("click", () => component.remove());
  }

  /**
   * @param {Element} component
   * @returns {boolean}
   */
  static #validation(component) {
    const inputBoardName  = component.querySelector("#board_name");
    const boardsOfColumns = component.querySelector("ul");

    if (!inputBoardName)  throw new Error("Can't find <input id=\"board_name\">");
    if (!boardsOfColumns) throw new Error("Can't find <ul>");

    let isValid = true;

    // @ts-ignore
    if (!inputBoardName.value.trim()) { // input (must not be empty)
      inputBoardName.setAttribute("style", "border-color: red;");
      isValid = false;
    }

    [...boardsOfColumns.children].forEach((item) => {
      if (!item.querySelector("input")?.value.trim()) { // board of columns (must not be empty)
	item.querySelector("input")?.setAttribute("style", "border-color: red;");
	isValid = false;
      }
    });

    return isValid;
  }
}
