// @ts-check

import { BoardsListItem } from "./boards_list_item.js";
import { insert }         from "./helpers.js";

export class BoardsList {

  static prefix = "boards_list";

  /**
   * @param {import("./board.js").BoardType[]} boards
   * @returns {string} HTML string
   */
  static template(boards) {
    const boardsListItems = boards.map(
      (board, index) => BoardsListItem.template(
	{
	  id:       board.id,
	  title:    board.name,
	  selected: index === 0
	}
      )
    ).join("");
    return `<article id="${this.prefix}">
              <header class="pad-left-l">ALL BOARDS (${boards.length})</header>
              <ul>${boardsListItems}</ul>
              <button class="pad-v-m">+ Create New Board</button>
            </article>`;
  }

  /**
   * @param {import("./board.js").BoardType[]} boards
   * @returns {Element}
   */
  static init(boards) {
    return BoardsList.#create(boards);
  }

  /**
   * @param {import("./board.js").BoardType[]} boards
   * @returns {Element}
   */
  static #create(boards) {
    const template     = document.createElement("template");
    template.innerHTML = BoardsList.template(boards);
    const component    = template.content.firstElementChild;
    if (!component) throw new Error("Can't create \"BoardsList\" component");

    BoardsList.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static handleEvents(component) {
    // btn "Create New Board"
    component.querySelector(":scope > button")?.addEventListener("click", async () => {
      const { CreateNewBoardDialog } = await import("../components/create_new_board_dialog.js");
      const dialog = CreateNewBoardDialog.init();
      document.querySelector("body")?.appendChild(dialog);
      // @ts-ignore
      dialog.showModal();
    });

    component.addEventListener("board:created", (event) => {
      const header = component.querySelector("header");
      const ul     = component.querySelector("ul");
      if (!header) throw new Error("Can't find <header>");
      if (!ul)     throw new Error("Can't find <ul>");

      header.textContent = `ALL BOARDS (${[...ul.children].length + 1})`;
      ul.querySelector("li.selected")?.classList.remove("selected");      
      ul.appendChild(
	// @ts-ignore
        BoardsListItem.init({ id: event.detail.id, title: event.detail.name, selected: true })
      );

      console.log("board:created");
    });

    component.addEventListener("board:updated", (event) => {
      insert(
	// @ts-ignore
        BoardsListItem.init({id: event.detail.id, title: event.detail.name, selected: true}),
        "ul > li.selected",
        component
      );      

      console.log("board:updated");
    });

    component.addEventListener("board:deleted", (event) => {
      const header          = component.querySelector("header");
      const ul              = component.querySelector("ul");
      // @ts-ignore
      const firstElement    = component.querySelector(`ul > li:not(#${BoardsListItem.prefix}-${event.detail})`);
      // @ts-ignore
      const removingElement = component.querySelector(`#${BoardsListItem.prefix}-${event.detail}`);

      if (!header)          throw new Error("Missing <header>");
      if (!ul)              throw new Error("Missing <ul>");
      // @ts-ignore
      if (!removingElement) throw new Error(`Missing id=\"${BoardsListItem.prefix}-${event.detail}\"`);
      if (!firstElement)    throw new Error("Missing the first element in \"Boards list\"");

      header.textContent = `ALL BOARDS (${[...ul.children].length - 1})`;
      removingElement.remove();
      // @ts-ignore
      firstElement.click(); // make the first item of the Boards list selected

      console.log("board:deleted");
    });
  }
}
