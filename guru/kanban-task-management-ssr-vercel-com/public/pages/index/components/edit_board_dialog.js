// @ts-check

import { Board }          from "./board.js";
import { Column }         from "./column.js";
import { BoardsList }     from "./boards_list.js";
import { DynamicList }    from "./dynamic_list.js";
import { MainHeader }     from "./main_header.js";

export class EditBoardDialog { // listens to [dynamic-list-item:changed, added, removed]
  /** @type { import("./board.js").BoardType } */
  static #state =  {
    id: "",
    name: "",
    columns: [{ id: "", name: "", tasks: [] }]
  };

  /** @returns { import("./board.js").BoardType } */
  static #getState() {
    return JSON.parse(JSON.stringify(this.#state));
  }

  /** @param { import("./board.js").BoardType } value */
  static #setState(value) {
    this.#state = value;
  }

  /** @returns {string} HTML string */
  static #template() {
    return `<dialog class="bg-n-000-800">
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

    const ul = document.querySelector(`[data-prefix="${Board.prefix}"] ul`);
    if (!ul) throw new Error(`[data-prefix="${Board.prefix}"] <ul> is missing`);

    [...ul.children].forEach(column => {
      const columnID = column.getAttribute("data-id");
      const h3       = column.querySelector("h3");
      if (!columnID) throw new Error(`${Column.prefix} [data-id] is missing`);
      if (!h3)       throw new Error(`${Column.prefix} <h3> is missing`);

      const textContent = h3.textContent;
      if (!textContent) throw new Error(`${Column.prefix} <h3> is empty`);

      // position of " (", e.g Todo (3)
      const name = textContent.slice(0, textContent.lastIndexOf("(") - 1);

      dynamicListItems.push({
	id:                columnID,
	value:             name,
	placeholder:       "e.g. TODO",
	deleteBtnDisabled: [...ul.children].length === 1
      });

      columns.push({ id: columnID, name: name, tasks: [] });
    });

    const title   = document.querySelector (`[data-prefix="${MainHeader.prefix}"] h2`)?.textContent;
    const boardID = document.querySelector(`[data-prefix="${BoardsList.prefix}"] ul > li.selected`)?.getAttribute("data-id");
    if (!title)   throw new Error(`[data-prefix="${MainHeader.prefix}"] <h2> is empty`);
    if (!boardID) throw new Error(`[data-prefix="${BoardsList.prefix}"] ul > li.selected [data-id] is missing`);

    /** @type { import("./board.js").BoardType } */
    const state = {
      id:      boardID,
      name:    title,
      columns: columns
    };

    this.#setState(state);

    const component = this.#create();
    const dynamicList = component.querySelector("dynamic-list");
    if (!dynamicList) throw new Error("<dynamic-list> is missing");

    dynamicList.replaceWith(
      DynamicList.init({
	title: "Board Columns",
	items: dynamicListItems,
	btnText: "+ Add New Column",
	min: 1,
	max: 5
      })
    );

    return component;
  }

  /** @returns {Element} */
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
    const controlBtns = component.querySelectorAll("button");
    const saveBtn     = controlBtns[1];
    const revertBtn   = controlBtns[2];

    const input = component.querySelector("#board_name");
    if (!input) throw new Error(`<input id="board_name"> is missing`);

    input.addEventListener("input", function() {
      this.removeAttribute("style");
      checkEditBoardDialogState();
    });

    // save btn
    saveBtn.addEventListener("click", async function() {
      if (!validation()) return;

      const sendingBoardData = getDifferences();

      if (!sendingBoardData) return;

      const mainHeader = document.querySelector(`[data-prefix="${MainHeader.prefix}"]`);
      const board      = document.querySelector(`[data-prefix="${Board.prefix}"]`);
      const boardsList = document.querySelector(`[data-prefix="${BoardsList.prefix}"]`);
      if (!mainHeader) throw new Error(`[data-prefix="${MainHeader.prefix}"] is missing`);
      if (!board)      throw new Error(`[data-prefix="${Board.prefix}"] is missing`);
      if (!boardsList) throw new Error(`[data-prefix="${BoardsList.prefix}"] is missing`);

      if (globalThis.client_variables.is_anonymous) {
	sendingBoardData.columns.forEach(
	  column => { if (column.id === "") column.id = crypto.randomUUID() }
	);

	// console.log(sendingBoardData);

	component.remove(); // close this dialog
	[board, boardsList, mainHeader].forEach(item => {
	  item.dispatchEvent(new CustomEvent("board:updated", { detail: sendingBoardData }))
	});

	return;
      }

      this.setAttribute("disabled", ""); // disabled saveBtn

      // add indicator
      const { LoaderRipple } = await import("../../_shared/components/loader_ripple.js");
      const loader = LoaderRipple.init();
      loader.classList.add("clr-n-000");
      loader.setAttribute("style", "--size: 25px; right: 5%;");
      this.appendChild(loader);

      const url     = `/v1/boards/${sendingBoardData.id}`;
      const options = {
	method: "PUT",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({ board: sendingBoardData }),
      };

      // [Errors 401, 403, 404, 405, 500] [Success 200]
      const response = await fetch(url, options);

      if (response.status === 401 || response.status === 403) {
	if (response.status === 401) {
	  const { openAuthzDialog } = await import("../functions.js");
	  await openAuthzDialog();
	}

	if (response.status === 403) {
	  const { openSessionExpiredDialog } = await import("../functions.js");
	  await openSessionExpiredDialog();
	}

	this.removeAttribute("disabled"); // enable saveBtn
	loader.remove();

	return;
      };

      if (response.status === 404 || response.status !== 200) {
	component.remove();
	const { openPopUp } = await import("../../_shared/functions.js");
	await openPopUp(
	  response.status === 404 ? "Search error" : "Server error",
	  response.status === 404 ? "Board not found" : "Something went wrong. Try again"
	)

	return;
      }

      component.remove();

      const receivedBoardData = await response.json();
      [board, boardsList, mainHeader].forEach(item => {
	item.dispatchEvent(new CustomEvent("board:updated", { detail: receivedBoardData }))
      });
    });

    revertBtn.addEventListener("click", () => {
      const state = this.#getState();

      /** @type {HTMLInputElement|null} */
      const inputBoardName = component.querySelector("#board_name");
      if (!inputBoardName) throw new Error(`<input id="board_name"> is missing`);

      inputBoardName.value = state.name;
      inputBoardName.removeAttribute("style");

      /** @type {import("./dynamic_list_item.js").DynamicListItemType[]} */
      const items = state.columns.map(column => {
	return {
	  id: column.id,
	  value: column.name,
	  placeholder: "e.g. TODO",
	  deleteBtnDisabled: state.columns.length === 1 ? true : false
	};
      });

      // revert dynamic list (create a new one and insert the modified list insteed)
      const currentDynamicList = component.querySelector("[data-id]");
      if (!currentDynamicList) throw new Error("DynamicList is missing");

      currentDynamicList.replaceWith(
	DynamicList.init({
	  title: "Board Columns",
	  items: items,
	  btnText: "+ Add New Column",
	  min: 1,
	  max: 5
	})
      );

      saveBtn.setAttribute("disabled", "");
      revertBtn.setAttribute("disabled", "");
    });

    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error(`<button aria-label="close"> is missing`);
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

    /** @returns {import("./board.js").BoardType|null} Returns differences or null (no differences) */
    function getDifferences() {
      /** @type {HTMLInputElement|null} */
      const boardNameInput = component.querySelector("#board_name");
      const listOfColumns  = component.querySelector("ul");
      if (!boardNameInput) throw new Error(`<input id="board_name"> is missing`);
      if (!listOfColumns)  throw new Error(`<ul> is missing`);

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
	  if (!input) throw new Error("<input> is missing");

	  const id = input.getAttribute("data-id");
	  if (i === 0 && !id) { // i === 0 it's helps push only once
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

    /** @returns {boolean} */
    function validation() {
      const inputBoardName  = component.querySelector("#board_name");
      const listOfColumns   = component.querySelector("ul");
      if (!inputBoardName) throw new Error(`<input id="board_name"> is missing`);
      if (!listOfColumns)  throw new Error("<ul> is missing");

      let isValid = true;

      // @ts-ignore
      if (!inputBoardName.value.trim()) { // input (must not be empty)
	inputBoardName.setAttribute("style", "border-color: red;");
	isValid = false;
      }

      [...listOfColumns.children].forEach((item) => {
	if (!item.querySelector("input")?.value.trim()) { // Board columns (must not be empty)
	  item.querySelector("input")?.setAttribute("style", "border-color: red;");
	  isValid = false;
	}
      });

      return isValid;
    }
  }
}

