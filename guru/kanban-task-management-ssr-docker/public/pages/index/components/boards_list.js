// @ts-check

import { BoardsListItem } from "./boards_list_item.js";

// listens to [board:selected, created, updated, deleted]
export class BoardsList {

  static prefix   = "boards_list"; // add_new_board_dialog.js
  static selector = `#${this.prefix}`;

  /**
   * @param {import("./board.js").BoardType[]} props
   *
   * @returns {string} HTML string
   */
  static template(props) {
    const path           = `data-path="http://localhost:3000/pages/index/components/boards_list.js"`;
    const boardsListItem = props.map(
      (board, index) => BoardsListItem.template({
	id: board.id, title: board.name, selected: index === 0
      })
    ).join("");

    return `<article id="${this.prefix}" ${path}>
              <header class="fs-300 fw-bold clr-n-600 letter-spacing-m pad-left-l pad-v-m">ALL BOARDS (${props.length})</header>
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
      const { AddNewBoardDialog } = await import("../components/add_new_board_dialog.js");
      const dialog = AddNewBoardDialog.init();
      document.querySelector("body")?.appendChild(dialog);
      // @ts-ignore
      dialog.showModal();
    });

    // btn "Edit Board"
    btns[1].addEventListener("click", async () => {
      const { EditBoardDialog } = await import("../components/edit_board_dialog.js");
      const dialog = EditBoardDialog.init();
      document.querySelector("body")?.appendChild(dialog);
      // @ts-ignore
      dialog.showModal();
    });

    // btn "Delete Board"
    btns[2].addEventListener("click", async () => {
      const { DeleteBoardDialog } = await import("../components/delete_board_dialog.js");
      const dialog = DeleteBoardDialog.init();
      document.querySelector("body")?.appendChild(dialog);
      // @ts-ignore
      dialog.showModal();
    });

    // btn "Add New Task"
    btns[3].addEventListener("click", async () => {
      const { AddNewTaskDialog } = await import("../components/add_new_task_dialog.js");
      const dialog = AddNewTaskDialog.init();
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
      // @ts-ignore
      const data = event.detail;
      ul.appendChild(
	BoardsListItem.init({
	  id: data.id,
	  title: data.name,
	  selected: true,	  
	  locked: globalThis.role === "anonymous"
	})
      );

      console.log("board:created");
    });

    component.addEventListener("board:updated", async (event) => {
      // @ts-ignore
      const data = event.detail;
      const { insert } = await import("./_helpers.js");
      insert(
	BoardsListItem.init({ id: data.id, title: data.name, selected: true }),
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
