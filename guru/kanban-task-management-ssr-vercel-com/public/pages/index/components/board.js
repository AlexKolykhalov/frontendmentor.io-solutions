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
    return `<div class="column" id="${this.prefix}">
              <div class="row gap-m no-wrap pad-bottom-m bg-n-100-900" style="height: calc(100vh - 4.5rem)">
	        <ul class="[ flex-5 ] reel">
                  ${board.columns.map(column => Column.template(column)).join("")}
                </ul>
                <button class="[ flex-1 ] fs-900 fw-bold mar-top-l border-radius-m clr-n-600 clr-p-purple:hover bg-n-000-800">+ New Column</button>
              </div>
              <button class="[ md:display-none m:display-none ] hide-sidebar-btn show" style="position: absolute; bottom: calc(1rem + 20px);">
                <img src="images/svg/icon-show-sidebar.svg" alt="">
                Show Sidebar
              </button>
	    </div>`;
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
    // btn "New Column"
    component.querySelector("button.flex-1")?.addEventListener("click", async () => {
      const { EditBoardDialog } = await import("../components/edit_board_dialog.js");
      const dialog = EditBoardDialog.init();
      document.querySelector("body")?.appendChild(dialog);
      // @ts-ignore
      dialog.showModal();
    });

    // btn "Hide sidebar"
    component.querySelector(":scope > button")?.addEventListener("click", function() {
      const sidebar = document.querySelector("main > .with-left-sidebar > :nth-child(1)");
      if (!sidebar) throw new Error("Missing main > .with-left-sidebar > :nth-child(1)");

      this.classList.add("md:display-none");
      sidebar.classList.remove("md:display-none");
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
      const boardColumns = component.querySelector(`ul`);
      if (!boardColumns) throw new Error(`Missing #${Board.prefix} <ul>`);

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
