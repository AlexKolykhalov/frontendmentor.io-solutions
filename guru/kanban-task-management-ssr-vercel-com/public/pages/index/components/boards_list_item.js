// @ts-check

/**
 * @typedef {object}   BoardsListItemType
 * @property {string}  id
 * @property {string}  title
 * @property {boolean} [selected] By default "false".
 * @property {boolean} [locked]   By default "false".
 */

export class BoardsListItem {
  static prefix = "boards-list-item"; // using in edit_board_dialog.js

  /**
   * @param {BoardsListItemType} props
   * @returns {string} HTML string
   */
  static template(props) {
    if (typeof window === "undefined" && typeof document === "undefined") // if SSR
      globalThis.paths[this.prefix] = "/pages/index/components/boards_list_item.js";

    return `<li class="boards-list-item ${props.selected ? "selected" : ""}" data-prefix="${this.prefix}" data-id="${props.id}" ${props.locked ? "data-locked" : ""}>
              <img src="images/svg/${props.locked ? "icon-locked" : "icon-board-grey"}.svg" alt="" width="16" height="16">${props.title}
            </li>`;
  }

  /**
   * @param {BoardsListItemType} props
   * @returns {Element}
   */
  static init(props) {
    return this.#create(props);
  }

  /**
   * @param {BoardsListItemType} props
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
    if (component.hasAttribute("data-locked")) {
      component.addEventListener("click", async function() {
	if (this.classList.contains("selected")) return;

	const { openAuthzDialog } = await import("../functions.js");
	await openAuthzDialog();
      });

      component.removeAttribute("data-locked");
    } else {
      component.addEventListener("click", async function() {
	if (this.classList.contains("selected"))   return;
	if (document.querySelector(`.lds-ripple`)) return; // disable clicks on Tasks or BoardsList items

	// add indicator
	const { LoaderRipple } = await import("../../_shared/components/loader_ripple.js");
	const loader = LoaderRipple.init();
	component.appendChild(loader);

	const boardID = component.getAttribute("data-id");
	if (!boardID) throw new Error("[data-id] is missing");

	// [Errors 401, 403, 404, 405, 500] [Success 200]
	const response = await fetch(`/v1/boards/${boardID}`);

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
	}

	if (response.status === 404 || response.status !== 200) {
	  const { openPopUp } = await import("../../_shared/functions.js");
	  await openPopUp(
	    response.status === 404 ? "Search error" : "Server error",
	    response.status === 404 ? "Board not found" : "Something went wrong. Try again"
	  );
	  loader.remove();

	  return;
	}

	/** @type {import("./board.js").BoardType} */
	const receivedBoardData = await response.json();
	component.childNodes[2].nodeValue = receivedBoardData.name; // update BoardsListItem title
	const { Board }      = await import("./board.js");
	const { MainHeader } = await import("./main_header.js");
	const board      = document.querySelector(`[data-prefix="${Board.prefix}"]`);
	const mainHeader = document.querySelector(`[data-prefix="${MainHeader.prefix}"]`);
	if (!board)      throw new Error(`[data-prefix="${Board.prefix}]" is missing`);
	if (!mainHeader) throw new Error(`[data-prefix="${MainHeader.prefix}"] is missing`);

	this.parentElement.querySelector("li.selected")?.classList.remove("selected");
	this.classList.add("selected");
	loader.remove();

	[board, mainHeader].forEach(item => {
	  item.dispatchEvent(new CustomEvent("board:selected", { detail: receivedBoardData }));
	});
      });
    }
  }
}
