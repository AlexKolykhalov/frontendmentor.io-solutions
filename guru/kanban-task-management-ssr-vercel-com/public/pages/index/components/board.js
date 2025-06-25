// @ts-check

import { Column } from "./column.js";

/**
 * @typedef {Object} BoardType
 * @property {string} id
 * @property {string} name
 * @property {import("./column.js").ColumnType[]} columns
 */

export class Board {

  static prefix = "board";

  /**
   * @param {BoardType} board
   * @returns {string} HTML string
   */
  static template(board) {
    return `<section id="${this.prefix}">
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
   * @param {BoardType} board
   * @returns {Element}
   */
  static init(board) {
    return Board.#create(board);
  }

  /**
   * @param {BoardType} board
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
    // btn "Edit board"
    component.querySelectorAll("button")[0].addEventListener("click", async () => {
      const { EditBoardDialog } = await import("../components/edit_board_dialog.js");
      const dialog = EditBoardDialog.init();
      document.querySelector("body")?.appendChild(dialog);
      // @ts-ignore
      dialog.showModal();
    });

    // btn "Add New Task"
    component.querySelectorAll("button")[1].addEventListener("click", async () => {
      const { AddNewTaskDialog } = await import("../components/add_new_task_dialog.js");
      const dialog = AddNewTaskDialog.init();
      document.querySelector("body")?.appendChild(dialog);
      // @ts-ignore
      dialog.showModal();
    });

    // btn "New Column"
    component.querySelector("button.flex-1")?.addEventListener("click", async () => {
      const { EditBoardDialog } = await import("../components/edit_board_dialog.js");
      const dialog = EditBoardDialog.init();
      document.querySelector("body")?.appendChild(dialog);
      // @ts-ignore
      dialog.showModal();
    });

    component.addEventListener("board:selected", (event) => {
      // @ts-ignore
      operation("select", event.detail);
      console.log("board:selected");
    });

    component.addEventListener("board:created", (event) => {
      // @ts-ignore
      operation("select", event.detail);
      console.log("board:created");
    });

    component.addEventListener("board:updated", (event) => {
      // @ts-ignore
      operation("update", event.detail);
      console.log("board:updated");
    });

    /**
     * @param {string} type Available values are "select" and "update"
     * @param {BoardType} board
     */
    function operation(type, board) {
      const boardTitle   = component.querySelector(`h2`);
      const boardColumns = component.querySelector(`ul`);
      if (!boardTitle)   throw new Error(`Missing #${Board.prefix} <h2>`);
      if (!boardColumns) throw new Error(`Missing #${Board.prefix} <ul>`);

      console.log(board);

      boardTitle.innerHTML = board.name;

      if (type === "update") {
	const columnArray = [...boardColumns.children];
	board.columns.forEach((/** @type {import("./column.js").ColumnType} */ column, i) => {
	  const currentColumn = columnArray[i];
	  // create
	  if (!currentColumn) {
	    console.log("create column");
	    boardColumns.appendChild(Column.init(column));
	  } else {
	    const id = currentColumn.getAttribute("id")?.slice(`${Column.prefix}-`.length);
            // update
	    if (column.id === id && column.name) {
	      const h3 = currentColumn.querySelector("h3");
	      if (!h3) throw new Error("Missing <h3> in column");
              const tasksCount = h3.textContent?.slice(h3.textContent?.lastIndexOf("("));
	      h3.textContent = `${column.name} ${tasksCount}`;
	    }
	    // delete
	    if (column.id === id && !column.name) boardColumns.removeChild(currentColumn);
	  }
	});
      }
      if (type === "select") {
	boardColumns.innerHTML = "";
	board.columns.forEach((/** @type {import("./column.js").ColumnType} */ column) => {
	  boardColumns.appendChild(Column.init(column));
	});
      }
    }
  }
}
