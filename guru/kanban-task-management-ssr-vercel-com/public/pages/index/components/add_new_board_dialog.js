// @ts-check

import { DynamicList } from "./dynamic_list.js";

export class AddNewBoardDialog {
  /** @returns {string} HTML string */
  static #template() {
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
                <button class="[ relative ] fw-bold fs-300 clr-n-000 pad-h-m pad-v-sm border-radius-l bg-p-purple">Create New Board</button>
              </div>
            </dialog>`;
  }

  /** @returns {Element} */
  static init() {
    const component = this.#create();
    const element   = component.querySelector("dynamic-list");
    if (!element)   throw new Error("<dynamic-list> is missing");

    element.replaceWith(
      DynamicList.init({
	title: "Board Columns",
	items: [{ placeholder: "e.g. TODO", deleteBtnDisabled: true }],
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
    // "Board name" input
    const input = component.querySelector("#board_name");
    if (!input) throw new Error(`<input id="board_name"> is missing`);
    input.addEventListener("input", function() { this.removeAttribute("style") });

    // "Create new board" btn
    const createNewBtn = component.querySelector("dynamic-list + button");
    if (!createNewBtn) throw new Error(`<dynamic-list> + <button> is missing`);
    createNewBtn.addEventListener("click", async function() {
      if (!validation()) return;

      const { Board }      = await import("./board.js");
      const { MainHeader } = await import("./main_header.js");
      const { BoardsList } = await import("./boards_list.js");
      const mainHeader = document.querySelector(`[data-prefix="${MainHeader.prefix}"]`);
      const board      = document.querySelector(`[data-prefix="${Board.prefix}"]`);
      const boardsList = document.querySelector(`[data-prefix="${BoardsList.prefix}"]`);
      /** @type {HTMLInputElement|null} */
      const inputBoardName  = component.querySelector("#board_name");
      const boardsOfColumns = component.querySelector("ul");

      if (!mainHeader)      throw new Error(`[data-prefix="${MainHeader.prefix}"] is missing`);
      if (!board)           throw new Error(`[data-prefix="${Board.prefix}"] is missing`);
      if (!boardsList)      throw new Error(`[data-prefix="${BoardsList.prefix}"] is missing`);
      if (!inputBoardName)  throw new Error(`<input id="board_name"> is missing`);
      if (!boardsOfColumns) throw new Error("<ul> is missing");

      /** @type {import("./board.js").BoardType} */
      const sendingBoardData = {
	id: "",
	name: inputBoardName.value.trim(),
	columns: [...boardsOfColumns.children].map(column => {
	  return { id: "", name: column.querySelector("input")?.value.trim() ?? "", tasks: [] };
	})
      };

      if (globalThis.client_variables.is_anonymous) {
	sendingBoardData.id = crypto.randomUUID();
	sendingBoardData.columns.forEach(column => column.id = crypto.randomUUID());

	component.remove(); // close this dialog

	[board, boardsList, mainHeader].forEach(item => {
	  item.dispatchEvent(new CustomEvent("board:created", { detail: sendingBoardData }));
	});

	return;
      }

      this.setAttribute("disabled", ""); // disabled createNewBoardBtn

      // add indicator
      const { LoaderRipple } = await import("../../_shared/components/loader_ripple.js");
      const loader = LoaderRipple.init();
      loader.classList.add("clr-n-000");
      loader.setAttribute("style", "--size: 25px; right: 5%;");
      this.appendChild(loader);

      const url     = "/v1/boards";
      const options = {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({ board: sendingBoardData })
      };

      // [Errors 401, 403, 405, 500] [Success 201]
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

	this.removeAttribute("disabled"); // enabled createNewBoardBtn
	loader.remove();

	return;
      }

      if (response.status !== 201) {
	component.remove();
	const { openPopUp } = await import("../../_shared/functions.js");
	await openPopUp("Server error", "Something went wrong. Try again");

	return;
      };

      component.remove(); // close this dialog

      const receivedBoardData = await response.json();
      [board, boardsList, mainHeader].forEach(item => {
	item.dispatchEvent(new CustomEvent("board:created", { detail: receivedBoardData }));
      });
    });

    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error(`<button aria-label="close"> is missing`);
    closeDialogBtn.addEventListener("click", () => component.remove());

    // *** ADDITIONAL FUNCTIONS ***

    /** @returns {boolean} */
    function validation() {
      const inputBoardName  = component.querySelector("#board_name");
      const boardsOfColumns = component.querySelector("ul");
      if (!inputBoardName)  throw new Error(`<input id="board_name"> is missing`);
      if (!boardsOfColumns) throw new Error("<ul> is missing");

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
}
