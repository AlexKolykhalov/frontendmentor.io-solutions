// @ts-check

import { Column } from "./column.js";
import { getBoardData, insert } from "./helpers.js";
import { injectEvents } from "../js/inject.js";

export class Board {

  static prefix = "board";

  /**
   * @param {import("./types.js").Board} board
   * @returns {string} HTML string
   */
  static template(board) {
    return `<section id="${this.prefix}-${board.id}">
	      <header class="row main-axis-space-between bg-n-000">
                <div class="row gap-m">
	          <h2>${board.name}</h2>
                  <button>Edit board</button>
                </div>
	        <button>+ Add New Task</button>
	      </header>
              <div class="row no-wrap bg-n-100">
	        <ul class="reel flex-5">
                  ${board.columns.map(column => Column.template(column)).join("")}
                </ul>
                <button class="flex-1">+ New Column</button>
              </div>
	    </section>`;
  }

  /**
   * @param {import("./types.js").Board} board
   * @returns {Element}
   */
  static init(board) {
    const component = Board.#create(board);
    injectEvents(component);

    return component;
  }

  /**
   * @param {import("./types.js").Board} board
   * @returns {Element}
   */
  static #create(board) {
    const template     = document.createElement("template");
    template.innerHTML = Board.template(board);
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error("Can't create \"Board\" component");

    Board.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static handleEvents(component) {
    // edit board
    component.querySelectorAll("button")[0].addEventListener("click", async () => {
      const { EditBoardDialog } = await import("../components/edit_board_dialog.js");
      const dialog = EditBoardDialog.init();
      document.querySelector("body")?.appendChild(dialog);
      // @ts-ignore
      dialog.showModal();
    });
    
    // add new task
    component.querySelectorAll("button")[1].addEventListener("click", async () => {
      const { AddNewTaskDialog } = await import("../components/add_new_task_dialog.js");
      const dialog = AddNewTaskDialog.init();
      document.querySelector("body")?.appendChild(dialog);
      // @ts-ignore
      dialog.showModal();
    });

    // add new column
    component.querySelector("button.flex-1")?.addEventListener("click", async () => {
      const { AddNewColumnDialog } = await import("../components/add_new_column_dialog.js");
      const dialog = AddNewColumnDialog.init();
      document.querySelector("body")?.appendChild(dialog);
      // @ts-ignore
      dialog.showModal();
    });

    component.addEventListener("board:create", (event) => {
      console.log("board:create");
      insert(Board.init(event.detail), `#${component.getAttribute("id")}`, document);
    });

    component.addEventListener("board:update", (event) => {
      console.log("board:update");
      insert(Board.init(event.detail), `#${component.getAttribute("id")}`, document);
    });

    component.addEventListener("board:select", (event) => {
      console.log("board:select");      
      insert(
	Board.init(getBoardData(event.detail.id)),
	`#${component.getAttribute("id")}`,
	document
      );
    });

    component.addEventListener("column:create", (event) => {
      console.log("column:create");
      // @ts-ignore
      component.querySelector("ul")?.appendChild(Column.init(event.detail));
    });
  }
}

