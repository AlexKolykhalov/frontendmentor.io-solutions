// @ts-check

import { BoardsListItem } from "./boards_list_item.js";

export class BoardsList {

  static prefix = "boards_list";

  /**
   * @param {Array<import("./types.js").Board>} boards
   * @returns {string} HTML string
   */
  static template(boards) {
    return `<article id="${this.prefix}">
	      <header class="pad-left-l">ALL BOARDS (${boards.length})</header>
	      <ul>
                ${boards.map(board => BoardsListItem.template({id: board.id, title: board.name})).join("")}
              </ul>
              <button class="pad-v-m">+ Create New Board</button>
	    </article>`;
  }

  /**
   * @param {Array<import("./types.js").Board>} boards
   * @returns {Element}
   */
  static init(boards) {
    return BoardsList.#create(boards);
  }

  /**
   * @param {Array<import("./types.js").Board>} boards
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
    component.querySelector(":scope > button")?.addEventListener("click", async () => {
      const { CreateNewBoardDialog } = await import("../components/create_new_board_dialog.js");
      const dialog = CreateNewBoardDialog.init();
      document.querySelector("body")?.appendChild(dialog);
      dialog.showModal();
    });

    component.addEventListener("board:create", (event) => {
      console.log("board:create");
      const header = component.querySelector("header");
      const ul     = component.querySelector("ul");
      if (!header) throw new Error("Can't find <header>");
      if (!ul)     throw new Error("Can't find <ul>");

      header.textContent = `ALL BOARDS (${[...ul.children].length + 1})`;
      ul.querySelector("li.selected")?.classList.remove("selected");
      ul.appendChild(
	BoardsListItem.init({ id: event.detail.id, title: event.detail.name, selected: true })
      );
    });
  }
}
