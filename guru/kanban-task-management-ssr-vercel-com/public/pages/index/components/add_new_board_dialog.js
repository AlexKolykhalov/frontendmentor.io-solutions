// @ts-check

import { Board }        from "./board.js";
import { BoardsList }   from "./boards_list.js";
import { DynamicList }  from "./dynamic_list.js";
import { MainHeader }   from "./main_header.js";
import { emit, insert } from "./helpers.js";

export class CreateNewBoardDialog {
  /** @returns {string} HTML string */
  static template() {
    return `<dialog class="bg-n-000-800">
              <div class="column gap-l">
                <div class="row gap-m no-wrap main-axis-space-between cross-axis-start">
                  <h2 class="fs-900 clr-n-900-000" style="max-width: 80%">Add new board</h2>
                  <button class="close-btn" aria-label="close"></button>
                </div>
                <div class="column gap-sm fs-300 fw-medium">
                  <label class="clr-n-600-000" for="board_name">Board Name</label>
                  <input class="pad-sm clr-n-900-000 bg-n-100-900" id="board_name" placeholder="e.g. Home work">
                </div>
                <dynamic-list></dynamic-list>
                <button class="fw-bold fs-300 clr-n-000 pad-h-m pad-v-sm border-radius-l bg-p-purple">Create New Board</button>
              </div>
            </dialog>`;
  }

  /** @returns {Element} */
  static init() {
    const component = CreateNewBoardDialog.#create();

    insert(
      DynamicList.init({
	title: "Board Columns",
	items: [{ inputPlaceholder: "e.g. TODO", deleteBtnDisabled: true }],
	btnText: "+ Add New Column",
	limit: 5
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
    template.innerHTML = CreateNewBoardDialog.template();
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error("Can't create \"CreateNewBoardDialog\" component");

    CreateNewBoardDialog.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static handleEvents(component) {
    const input = component.querySelector("#board_name");
    if (!input) throw new Error("Can't find <input id=\"board_name\">");
    input.addEventListener("input", function() { this.removeAttribute("style"); });

    const createNewBoardBtn = component.querySelector("dynamic-list + button");
    if (!createNewBoardBtn) throw new Error("Can't find <button>");
    createNewBoardBtn.addEventListener("click", async function() {

      if (!CreateNewBoardDialog.#validation(component)) return;

      const mainHeader = document.querySelector(`#${MainHeader.prefix}`);
      const board      = document.querySelector(`#${Board.prefix}`);
      const boardsList = document.querySelector(`#${BoardsList.prefix}`);
      /** @type {HTMLInputElement|null} */
      const inputBoardName  = component.querySelector("#board_name");
      const boardsOfColumns = component.querySelector("ul");

      if (!mainHeader)      throw new Error(`Missing <header id="${MainHeader.prefix}">`);
      if (!board)           throw new Error(`Missing <section id="${Board.prefix}">`);
      if (!boardsList)      throw new Error(`Missing <article id="${BoardsList.prefix}">`);
      if (!inputBoardName)  throw new Error("Missing <input id=\"board_name\">");
      if (!boardsOfColumns) throw new Error("Missing <ul>");

      /** @type {import("./board.js").BoardType} */
      const sendingBoardData = {
	id: "",
	name: inputBoardName.value.trim(),
	columns: [...boardsOfColumns.children].map(column => {
	  return { id: "", name: column.querySelector("input")?.value.trim() ?? "", tasks: [] };
	})
      };

      const response = await fetch(
	`http://localhost:4000/rpc/create_board`,
	{
	  method: "POST",
	  headers: {
	    "Content-Type": "application/json",
	    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYXV0aF91c2VyIn0.XC5n_hafVOMV1Ve7S2_5A0K5TmWURd_Q-zsoZgBFUTo",
	  },
	  body: JSON.stringify({ p_board: sendingBoardData })
	}
      )

      if (response.status === 401) throw new Error("Authentication error");
      if (response.status !== 200) throw new Error("Unexpected response status");

      const receivingBoardData = await response.json();

      emit("board:created", receivingBoardData, board);
      emit("board:created", receivingBoardData, boardsList);
      emit("board:created", receivingBoardData, mainHeader);

      component.remove();
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
