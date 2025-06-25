// @ts-check

import { Board }          from "./board.js";
import { Column }         from "./column.js";
import { BoardsList }     from "./boards_list.js";
import { BoardsListItem } from "./boards_list_item.js";
import { DynamicList }    from "./dynamic_list.js";
import { emit, insert }   from "./helpers.js";

export class EditBoardDialog {

  /** @type { import("./board.js").BoardType } */
  static #state = { id: "", name: "", columns: [{ id: "", name: "", tasks: [] }] };

  /** @returns { import("./board.js").BoardType } */
  static #getState() {
    return JSON.parse(JSON.stringify(this.#state));
  }

  /** @param { import("./board.js").BoardType } value */
  static #setState(value) {
    return this.#state = value;
  }

  /** @returns {string} HTML string */
  static template() {
    const title = document.querySelector(`#${Board.prefix} h2`)?.textContent;
    return `<dialog>
              <div class="column gap-l">
                <div class="row gap-m main-axis-space-between">
                  <h2>Edit board</h2>
                  <button aria-label="close"><img src="/images/svg/icon-cross.svg" alt=""></button>
                </div>
                <div class="column">
                  <label for="board_name">Board Name</label>
                  <input id="board_name" value="${title}">
                </div>
                <dynamic-list></dynamic-list>
                <div class="row">
                  <button disabled>Save Changes</button>
                  <button disabled>Revert</button>
                </div>
                <button>Delete board</button>
              </div>
            </dialog>`;
  }

  /** @returns { Element } */
  static init() {
    /** @type { import("./dynamic_list_item.js").DynamicListItemType[] } */
    const dynamicListItems = [];

    /** @type { import("./column.js").ColumnType[] } */
    const columns = [];

    const ul = document.querySelector(`#${Board.prefix} ul`);
    if (!ul) throw new Error(`Missing #${Board.prefix} <ul>`);

    [...ul.children].forEach(column => {
      const idAttr = column.getAttribute("id");
      if (!idAttr) throw new Error(`Missing column's ID attribute`);
      const h3 = column.querySelector("h3");
      if (!h3) throw new Error(`Missing <li id="${Column.prefix}-"> <h3>`);
      const textContent = h3.textContent;
      if (!textContent) throw new Error(`Empty textContent in <li id="${Column.prefix}-"> <h3>`);

      const id = idAttr.slice(`${Column.prefix}-`.length);
      // position of " (", e.g Todo (3)
      const name = textContent.slice(0, textContent.lastIndexOf("(") - 1);

      dynamicListItems.push({ inputID: id, inputValue: name, inputPlaceholder: "e.g. TODO" });
      columns.push({ id: id, name: name, tasks: []});
    });

    const h2 = document.querySelector(`#${Board.prefix} h2`);
    if (!h2) throw new Error(`Missing <h2>`);
    const title = h2.textContent;
    if (!title) throw new Error(`<h2> text content is empty`);
    const selectedBoardsListItem = document.querySelector(`#${BoardsList.prefix} ul > li.selected`);
    if (!selectedBoardsListItem) throw new Error(`Missing selected boards list item`);
    const selectedItemIdAttribute = selectedBoardsListItem.getAttribute("id");
    if (!selectedItemIdAttribute) throw new Error(`Missing ID attribute of the selected boards list item`);

    /** @type { import("./board.js").BoardType } */
    const state = {
      id:      selectedItemIdAttribute.slice(`${BoardsListItem.prefix}-`.length),
      name:    title,
      columns: columns
    };    

    this.#setState(state);

    const component = EditBoardDialog.#create();
    insert(
      DynamicList.init({
	title: "Board Columns",
	items: dynamicListItems,
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
    template.innerHTML = EditBoardDialog.template();
    const component    = template.content.firstElementChild;
    if (!component) throw new Error("Can't create \"EditBoardDialog\" component");

    EditBoardDialog.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static handleEvents(component) {
    const controlBtns = component.querySelectorAll("button");
    const saveBtn     = controlBtns[1];
    const revertBtn   = controlBtns[2];
    const deleteBtn   = controlBtns[3];

    const input = component.querySelector("#board_name");
    if (!input) throw new Error("Can't find <input id=\"board_name\">");

    input.addEventListener("input", function() {
      this.removeAttribute("style");
      checkEditBoardDialogState();
    });

    // save btn
    saveBtn.addEventListener("click", async function() {

      if (!EditBoardDialog.#validation(component)) return;

      const board      = document.querySelector(`#${Board.prefix}`);
      const boardsList = document.querySelector(`#${BoardsList.prefix}`);
      if (!board)      throw new Error(`Missing <section id="${Board.prefix}">`);
      if (!boardsList) throw new Error(`Missing <article id="${BoardsList.prefix}">`);

      const sendingBoardData = EditBoardDialog.#getDifferences(component);      

      if (sendingBoardData) {
	const response = await fetch(
	  `http://localhost:4000/rpc/update_board`,
	  {
	    method: "POST",
	    headers: {
	      "Content-Type": "application/json",
	      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYXV0aF91c2VyIn0.XC5n_hafVOMV1Ve7S2_5A0K5TmWURd_Q-zsoZgBFUTo",
	    },
	    body: JSON.stringify({ p_board: sendingBoardData }),
	  }
	);

	if (response.status === 401) throw new Error("Authentication error");
	if (response.status !== 200) throw new Error("Unexpected response status");

	const receivingBoardData = await response.json();

	emit("board:updated", receivingBoardData, board);      // rerenders the board
	emit("board:updated", receivingBoardData, boardsList); // changes name of the board

        component.remove();
      }
    });

    revertBtn.addEventListener("click", function() {
      console.log("revertBtn");

      const state = EditBoardDialog.#getState();

      /** @type {HTMLInputElement|null} */
      const inputBoardName  = component.querySelector("#board_name");
      if (!inputBoardName)  throw new Error("Can't find <input id=\"board_name\">");

      inputBoardName.value = state.name;

      /** @type { import("./dynamic_list_item.js").DynamicListItemType[] } */
      const items = state.columns.map(column => {
	return {
	  inputID: column.id,
	  inputValue: column.name,
	  deleteBtnDisabled: state.columns.length === 1 ? true : false
	};
      });

      insert(
	DynamicList.init({
	  title: "Board Columns",
	  items: items,
	  btnText: "+ Add New Column",
	  limit: 5
	}),
	"div.column.gap-sm",
	component
      );

      saveBtn.setAttribute("disabled", "");
      revertBtn.setAttribute("disabled", "");
    });

    // delete btn
    deleteBtn.addEventListener("click", async function() {
      const boardsList = document.querySelector(`#${BoardsList.prefix}`);
      if (!boardsList) throw new Error(`Can't find <article id="${BoardsList.prefix}">`);

      const boardData = EditBoardDialog.#getState();

      try {
	const response = await fetch(
	  `http://localhost:4000/rpc/delete_board`,
	  {
	    method: "POST",
	    headers: {
	      "Content-Type": "application/json",
	      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYXV0aF91c2VyIn0.XC5n_hafVOMV1Ve7S2_5A0K5TmWURd_Q-zsoZgBFUTo",
	    },
	    body: JSON.stringify({ p_id: boardData.id }),
	  }
	);

	if (response.status === 401) throw new Error("Authentication error");
	if (response.status !== 204) throw new Error("Unexpected response status");

	// remove deleted element from the "Boards list"
	emit("board:deleted", boardData.id, boardsList);
        component.remove();
      } catch (error) {
	console.log("Internet error connection");
      }
    });

    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error("Can't find <button aria-label=\"close\">");
    closeDialogBtn.addEventListener("click", () => {console.log("closeBtn");component.remove()});

    component.addEventListener("dynamic-list-item:change", () => checkEditBoardDialogState());
    component.addEventListener("dynamic-list-item:add",    () => checkEditBoardDialogState());
    component.addEventListener("dynamic-list-item:remove", () => checkEditBoardDialogState());

    function checkEditBoardDialogState() {
      if (EditBoardDialog.#getDifferences(component)) {
	saveBtn.removeAttribute("disabled");
	revertBtn.removeAttribute("disabled");
      } else {
	saveBtn.setAttribute("disabled", "");
	revertBtn.setAttribute("disabled", "");
      }
    }
  }

  /**
   * @param {Element} component
   *
   * @returns {boolean}
   */
  static #validation(component) {
    const inputBoardName  = component.querySelector("#board_name");
    const listOfColumns = component.querySelector("ul");

    if (!inputBoardName) throw new Error("Can't find <input id=\"board_name\">");
    if (!listOfColumns)  throw new Error("Can't find <ul>");

    let isValid = true;

    // @ts-ignore
    if (!inputBoardName.value.trim()) { // input (must not be empty)
      inputBoardName.setAttribute("style", "border-color: red;");
      isValid = false;
    }

    [...listOfColumns.children].forEach((item) => {
      if (!item.querySelector("input")?.value.trim()) { // board of columns (must not be empty)
	item.querySelector("input")?.setAttribute("style", "border-color: red;");
	isValid = false;
      }
    });

    return isValid;
  }

  /**
   * @param {Element} component
   *
   * @returns {import("./board.js").BoardType|null} Returns differences or null (no differences)
   */
  static #getDifferences(component) {
    /** @type {HTMLInputElement|null} */
    const boardNameInput = component.querySelector("#board_name");
    const listOfColumns  = component.querySelector("ul");
    if (!boardNameInput) throw new Error("Can't find <input id=\"board_name\">");
    if (!listOfColumns)  throw new Error("Can't find <ul>");

    let   flag      = false;
    let   addings   = [];    
    const stateData = EditBoardDialog.#getState();

    if (stateData.name !== boardNameInput.value.trim()) {
      flag = true;
      stateData.name = boardNameInput.value.trim();
    }

    for (let i = 0; i < stateData.columns.length; i++) {
      let isDelete = true;
      for (let j = 0; j < [...listOfColumns.children].length; j++) {
	const input = [...listOfColumns.children][j].querySelector("input");
	if (!input) throw new Error("Missing <input> in <li> element");
	const idAttr = input.getAttribute("id");
	if (!idAttr) throw new Error("Missing ID attribute in <input>");

	const id = idAttr.slice(`x-`.length);

	if (i === 0 && id.length !== 36) { // i === 0 it's helps push only once
	  addings.push({ id: "", name: input.value.trim(), tasks: [] }); // ADD
	  flag = true;
	};

        // checks the state's ID against the ID from the dialog
	if (stateData.columns[i].id === id) {
	  isDelete = false; // DO NOTHING
	  if (stateData.columns[i].name !== input.value.trim()) {
	    stateData.columns[i].name = input.value.trim(); // UPDATE
	    flag = true;
	  }
	}
      }
      if (isDelete) {
	stateData.columns[i].name = ""; // DELETE
	flag = true;
      }
    }
    stateData.columns.push(...addings);

    return flag ? stateData : null;
  }
}
