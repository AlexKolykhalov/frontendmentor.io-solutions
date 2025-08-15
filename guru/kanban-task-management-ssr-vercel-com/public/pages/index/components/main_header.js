// @ts-check

import { Board } from "./board.js";

export class MainHeader {
  
  static prefix   = "main_header";  // using in add_new_board_dialog.js
  static selector = `#${this.prefix}`;

  /**
   * @param {import("./board.js").BoardType} board
   *
   * @returns {string} HTML string
   */
  static template(board) {
    const path = `data-path="http://localhost:3000/pages/index/components/main_header.js"`;

    return `<header id="${this.prefix}" class="bg-n-000-800" style="height: 4.5rem;" ${path}>
              <div class="with-left-sidebar">
              	<div class="[ m:display-none ] pad-h-l pad-v-m">
                  <img src="/images/svg/logo-light.svg" height=30 alt="Logo">
                </div>
              	<div class="row gap-m main-axis-space-between cross-axis-center pad-m">
              	  <div class="row gap-d-sm-m cross-axis-center">
                    <img class="[ md:display-none ]" src="images/svg/logo-mobile.svg" alt="Logo mobile view">
              	    <h2 class="clr-n-900-000 fw-bold fs-d-300-900">${board.name}</h2>
                    <button class="[ md:display-none ] dropdown-list-toggle-btn"
                            aria-controls="dropdown_list"
                            aria-expanded="false"
                            aria-label="Dropdown list toggle button">
                      <img src="images/svg/icon-chevron-down.svg" alt="Icon chevron down">
                    </button>
                    <button class="transparent pad-sm border-radius-sm" aria-label="Edit board"><img src="images/svg/icon-edit.svg" alt=""></button>
                    <button class="transparent pad-sm border-radius-sm" aria-label="Delete board"><img src="images/svg/icon-delete.svg" alt=""></button>
              	  </div>
              	  <button class="[ m:display-none ] fw-bold fs-500 clr-n-000 bg-p-purple pad-h-m pad-v-sm border-radius-l">+ Add New Task</button>
              	</div>
              </div>
            </header>`;
  }

  /**
   * @param {Element} component
   *
   * @returns {void}
   */
  static handleEvents(component) {
    // Dropdown list toggle btn
    const dropdownListToggleBtn = document.querySelector(".dropdown-list-toggle-btn");
    if (!dropdownListToggleBtn) throw new Error("Missing .dropdown-list-toggle-btn");
    dropdownListToggleBtn.addEventListener("click", function() {
      const dropdownList = document.querySelector(".dropdown-list");
      if (!dropdownList) throw new Error(`Missing .dropdown-list`);

      dropdownList.classList.toggle("m:display-none");
      if (this.getAttribute("aria-expanded") === "true") {
	this.setAttribute("aria-expanded", "false");
	// remove backdrop
	document.querySelector(".backdrop")?.remove();
      } else {
	this.setAttribute("aria-expanded", "true");
	// add backdrop
	const backdrop = document.createElement("div");
	backdrop.classList.add("backdrop");
	backdrop.classList.add("md:display-none");
	backdrop.setAttribute("style", "background: rgba(0,0,0,0.5); position: fixed; width: 100%; height: 100%");
	document.querySelector(`#${Board.prefix}`)?.appendChild(backdrop);
      }
    });

    // btn "Edit board"
    component.querySelectorAll("button")[1].addEventListener("click", async () => {
      const { EditBoardDialog } = await import("../components/edit_board_dialog.js");
      const dialog = EditBoardDialog.init();
      document.querySelector("body")?.appendChild(dialog);
      // @ts-ignore
      dialog.showModal();
    });

    // btn "Delete board"
    component.querySelectorAll("button")[2].addEventListener("click", async () => {
      const { DeleteBoardDialog } = await import("../components/delete_board_dialog.js");
      const dialog = DeleteBoardDialog.init();
      document.querySelector("body")?.appendChild(dialog);
      // @ts-ignore
      dialog.showModal();
    });

    // btn "Add New Task"
    component.querySelectorAll("button")[3].addEventListener("click", async () => {
      const { AddNewTaskDialog } = await import("../components/add_new_task_dialog.js");
      const dialog = AddNewTaskDialog.init();
      document.querySelector("body")?.appendChild(dialog);
      // @ts-ignore
      dialog.showModal();
    });

    component.addEventListener("board:selected", (event) => {
      // @ts-ignore
      updateName(event.detail.name);

      console.log("board:selected");
    });

    component.addEventListener("board:created", (event) => {
      // @ts-ignore
      updateName(event.detail.name);

      console.log("board:created");
    });

    component.addEventListener("board:updated", (event) => {
      // @ts-ignore
      updateName(event.detail.name);

      console.log("board:updated");
    });

    /**
     * @param {string} name
     *
     * @returns {void} HTML string
     */
    function updateName(name) {
      const h2 = component.querySelector("h2");
      if (!h2) throw new Error("Missing <h2>");

      h2.textContent = name;
    }
  }
}
