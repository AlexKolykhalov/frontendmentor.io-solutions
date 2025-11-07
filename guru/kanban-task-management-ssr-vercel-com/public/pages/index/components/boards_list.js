// @ts-check

import { BoardsListItem } from "./boards_list_item.js";

export class BoardsList {
  static prefix = "boards-list"; // add_new_board_dialog.js

  /**
   * @param {import("./board.js").BoardType[]} props
   *
   * @returns {string} HTML string
   */
  static template(props) {
    const boardsListItem = props.map((board, index) =>
      BoardsListItem.template({ id: board.id, title: board.name, selected: index === 0 })
    ).join("");    
    globalThis.paths[this.prefix] = "/pages/index/components/boards_list.js";

    return `<article data-prefix="${this.prefix}">
              <h3 class="fs-300 fw-bold clr-n-600 letter-spacing-m pad-left-l pad-v-m">ALL BOARDS (${props.length})</h3>
              <ul>${boardsListItem}</ul>
              <br>
              <button class="boards-list-btn { row gap-m cross-axis-center }"><img src="images/svg/icon-create.svg" alt="">Create New Board</button>
              <button class="[ md:display-none ] boards-list-btn { row gap-m cross-axis-center }"><img src="images/svg/icon-edit.svg" alt="">Edit board</button>
              <button class="[ md:display-none ] boards-list-btn { row gap-m cross-axis-center }"><img src="images/svg/icon-delete.svg" alt="">Delete board</button>
              <br>
              <button class="[ md:display-none ] boards-list-btn { row gap-m cross-axis-center }"><img src="images/svg/icon-create.svg" alt="">Add New Task</button>
            </article>`;
  }

  /**
   * @param {Element} component
   *
   * @returns {void}
   */
  static handleEvents(component) {
    const btns = component.querySelectorAll("button");

    // btn "Create New Board"
    btns[0].addEventListener("click", async () => {
      const { AddNewBoardDialog } = await import("./add_new_board_dialog.js");
      const dialog = AddNewBoardDialog.init();
      document.querySelector("body")?.appendChild(dialog);
      // @ts-ignore
      dialog.showModal();
    });

    // btn "Edit Board"
    btns[1].addEventListener("click", async () => {
      const { EditBoardDialog } = await import("./edit_board_dialog.js");
      const dialog = EditBoardDialog.init();
      document.querySelector("body")?.appendChild(dialog);
      // @ts-ignore
      dialog.showModal();
    });

    // btn "Delete Board"
    btns[2].addEventListener("click", async () => {
      const { DeleteBoardDialog } = await import("./delete_board_dialog.js");
      const dialog = DeleteBoardDialog.init();
      document.querySelector("body")?.appendChild(dialog);
      // @ts-ignore
      dialog.showModal();
    });

    // btn "Add New Task"
    btns[3].addEventListener("click", async () => {
      const { AddNewTaskDialog } = await import("./add_new_task_dialog.js");
      const dialog = AddNewTaskDialog.init();
      document.querySelector("body")?.appendChild(dialog);
      // @ts-ignore
      dialog.showModal();
    });

    // *** ADDITIONAL LISTENERS ***

    component.addEventListener("board:created", (event) => {
      // @ts-ignore
      const board  = event.detail;
      const header = component.querySelector("h3");
      const ul     = component.querySelector("ul");
      if (!header) throw new Error(`<h3> is missing`);
      if (!ul)     throw new Error(`<ul> is missing`);

      ul.querySelector("li.selected")?.classList.remove("selected");
      const locked = globalThis.client_variables.is_anonymous;
      ul.appendChild(
	BoardsListItem.init({ id: board.id, title: board.name, selected: true, locked: locked })
      );
      header.textContent = `ALL BOARDS (${ul.children.length})`;

      console.log("board:created");
    });

    component.addEventListener("board:updated", (event) => {
      // @ts-ignore
      const board           = event.detail;
      const selectedElement = component.querySelector("ul > li.selected");
      if (!selectedElement) throw new Error(`<li class="selected"> is missing`);

      selectedElement.replaceWith(
	BoardsListItem.init({ id: board.id, title: board.name, selected: true })
      );

      console.log("board:updated");
    });

    component.addEventListener("board:deleted", (event) => {
      // @ts-ignore
      const boardID         = event.detail;
      const header          = component.querySelector("header");
      const ul              = component.querySelector("ul");
      const removingElement = component.querySelector(`[data-id="${boardID}"]`);
      if (!header)          throw new Error(`<header> is missing`);
      if (!ul)              throw new Error(`<ul> is missing`);
      if (!removingElement) throw new Error(`${BoardsListItem.prefix} [data-id="${boardID}"] is missing`);

      removingElement.remove();
      header.textContent = `ALL BOARDS (${ul.children.length})`;

      // @ts-ignore
      [...ul.children][0].click(); // click on the first element after remove

      console.log("board:deleted");
    });
  }
}
