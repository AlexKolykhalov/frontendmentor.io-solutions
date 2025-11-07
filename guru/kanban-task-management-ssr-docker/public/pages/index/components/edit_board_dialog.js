// @ts-check

import { Board }                            from "./board.js";
import { Column }                           from "./column.js";
import { BoardsList }                       from "./boards_list.js";
import { BoardsListItem }                   from "./boards_list_item.js";
import { DynamicList }                      from "./dynamic_list.js";
import { MainHeader }                       from "./main_header.js";
import { emit, insert, openRedirectDialog } from "./_helpers.js";

// listens to [dynamic-list-item:changed, added, removed]
export class EditBoardDialog {

  static prefix = "edit_board_dialog"; // using in dynamic_list.js

  /** @type { import("./board.js").BoardType } */
  static #state =  { id: "", name: "", columns: [{ id: "", name: "", tasks: [] }] };

  /** @returns { import("./board.js").BoardType } */
  static #getState() {
    return JSON.parse(JSON.stringify(this.#state));
  }

  /** @param { import("./board.js").BoardType } value */
  static #setState(value) {
    return this.#state = value;
  }

  /** @returns {string} HTML string */
  static #template() {
    return `<dialog id="${this.prefix}" class="bg-n-000-800">
              <div class="column gap-l">
                <div class="row gap-m main-axis-space-between">
                  <h2 class="fs-900 clr-n-900-000">Edit board</h2>
                  <button class="close-btn" aria-label="close"></button>
                </div>
                <div class="column gap-sm fs-300 fw-medium">
                  <label class="clr-n-600-000" for="board_name">Board Name</label>
                  <input class="pad-sm clr-n-900-000 bg-n-100-900" id="board_name" value="${this.#getState().name}">
                </div>
                <dynamic-list></dynamic-list>
                <div class="row gap-l main-axis-end">
                  <button class="[ relative ] fw-bold fs-300 pad-h-l clr-n-000 pad-v-sm border-radius-l bg-p-purple" disabled>Save Changes</button>
                  <button class="fw-bold fs-300 pad-h-m clr-n-000 pad-v-sm border-radius-l bg-p-purple" disabled>Revert</button>
                </div>
              </div>
            </dialog>`;
  }

  /** @returns { Element } */
  static init() {
    /** @type { import("./dynamic_list_item.js").DynamicListItemType[] } */
    const dynamicListItems = [];

    /** @type { import("./column.js").ColumnType[] } */
    const columns = [];

    const ul = document.querySelector(`#${Board.prefix} ul`); // current columns
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

      dynamicListItems.push({
	id:                id,
	value:             name,
	placeholder:       "e.g. TODO",
	deleteBtnDisabled: [...ul.children].length === 1
      });

      columns.push({ id: id, name: name, tasks: []});
    });

    const h2 = document.querySelector(`#${MainHeader.prefix} h2`);
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

    const component = this.#create();

    insert(
      DynamicList.init({
	title: "Board Columns",
	items: dynamicListItems,
	btnText: "+ Add New Column",
	min: 1,
	max: 5
      }),
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
    if (!component)    throw new Error("Can't create \"EditBoardDialog\" component");

    this.#handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   *
   * @returns {void}
   */
  static #handleEvents(component) {
    const controlBtns = component.querySelectorAll("button");
    const saveBtn     = controlBtns[1];
    const revertBtn   = controlBtns[2];

    const input = component.querySelector("#board_name");
    if (!input) throw new Error("Can't find <input id=\"board_name\">");

    input.addEventListener("input", function() {
      this.removeAttribute("style");
      checkEditBoardDialogState();
    });

    // save btn
    saveBtn.addEventListener("click", async function() {

      if (!validation()) return;

      const mainHeader = document.querySelector(`#${MainHeader.prefix}`);
      const board      = document.querySelector(`#${Board.prefix}`);
      const boardsList = document.querySelector(`#${BoardsList.prefix}`);
      if (!mainHeader) throw new Error(`Missing <header id="${MainHeader.prefix}">`);
      if (!board)      throw new Error(`Missing <section id="${Board.prefix}">`);
      if (!boardsList) throw new Error(`Missing <article id="${BoardsList.prefix}">`);

      const sendingBoardData = getDifferences();

      if (sendingBoardData) {
	if (globalThis.role === "anonymous") {
	  sendingBoardData.columns.forEach(
	    column => { if (column.id === "") column.id = crypto.randomUUID() }
	  );

	  emit("board:updated", sendingBoardData, board);      // rerenders the board
	  emit("board:updated", sendingBoardData, boardsList); // changes name of the board
	  emit("board:updated", sendingBoardData, mainHeader); // changes name of the board

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

	const url     = "http://localhost:4000/rpc/update_board";
	const options = {
	  method: "POST",
	  headers: {
	    "Content-Type": "application/json",
	    "Authorization": `Bearer ${ localStorage.getItem("bearer") }`,
	  },
	  body: JSON.stringify({ p_board: sendingBoardData }),
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
	};

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

	const receivingBoardData = await response.json();

	emit("board:updated", receivingBoardData, board);      // rerenders the board
	emit("board:updated", receivingBoardData, boardsList); // changes name of the board
	emit("board:updated", receivingBoardData, mainHeader); // changes name of the board

        component.remove();
      }
    });

    revertBtn.addEventListener("click", function() {
      const state = EditBoardDialog.#getState();

      /** @type {HTMLInputElement|null} */
      const inputBoardName  = component.querySelector("#board_name");
      if (!inputBoardName)  throw new Error("Can't find <input id=\"board_name\">");

      inputBoardName.value = state.name;
      inputBoardName.removeAttribute("style");

      /** @type {import("./dynamic_list_item.js").DynamicListItemType[]} */
      const items = state.columns.map(column => {
	return {
	  id: column.id,
	  value: column.name,
	  deleteBtnDisabled: state.columns.length === 1 ? true : false
	};
      });      

      // revert dynamic list (create a new one and insert the modified one insteed)
      insert(
	DynamicList.init({
	  title: "Board Columns",
	  items: items,
	  btnText: "+ Add New Column",
	  min: 1,
	  max: 5
	}),	
	`[id^=${DynamicList.prefix}-]`,
	component
      );

      saveBtn.setAttribute("disabled", "");
      revertBtn.setAttribute("disabled", "");
    });

    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error("Can't find <button aria-label=\"close\">");
    closeDialogBtn.addEventListener("click", () => component.remove());

    // *** ADDITIONAL LISTENERS ***

    component.addEventListener("dynamic-list-item:changed", () => checkEditBoardDialogState());
    component.addEventListener("dynamic-list-item:added",   () => checkEditBoardDialogState());
    component.addEventListener("dynamic-list-item:removed", () => checkEditBoardDialogState());

    // *** ADDITIONAL FUNCTIONS ***

    /** @returns {void} */
    function checkEditBoardDialogState() {
      if (getDifferences()) {
	saveBtn.removeAttribute("disabled");
	revertBtn.removeAttribute("disabled");
      } else {
	saveBtn.setAttribute("disabled", "");
	revertBtn.setAttribute("disabled", "");
      }
    }

    /** @returns {boolean} */
    function validation() {
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

    /***
     * @returns {import("./board.js").BoardType|null} Returns differences or null (no differences)
     */
    function getDifferences() {
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

	  let id = idAttr.slice(`x-`.length);
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
}
