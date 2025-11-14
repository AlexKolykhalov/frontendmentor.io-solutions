// @ts-check

import { BoardsList } from "./boards_list.js";

export class MainHeader { // listens to [board:selected, created, updated, deleted]
  static prefix = "main-header"; // using in add_new_board_dialog.js

  /**
   * @param {import("./board.js").BoardType} board
   *
   * @returns {string} HTML string
   */
  static template(board) {
    const deleteBoardBtn = globalThis.server_variables.boards_list_length === 1 ?
	  `<button class="[ m:display-none ] transparent pad-sm border-radius-sm" title="Delete board" aria-label="Delete board" disabled><img src="images/svg/icon-delete-gray.svg" alt=""></button>` :
	  `<button class="[ m:display-none ] transparent pad-sm border-radius-sm" title="Delete board" aria-label="Delete board"><img src="images/svg/icon-delete.svg" alt=""></button>`;
    const deleteUserBtn = globalThis.server_variables.is_anonymous ?
	  "" :
	  `<button class="transparent pad-sm border-radius-sm" title="Delete user" aria-label="Delete user"><img src="images/svg/icon-user-delete.svg" alt=""></button>`;

    globalThis.paths[this.prefix] = "/pages/index/components/main_header.js";

    return `<header class="bg-n-000-800" data-prefix="${this.prefix}" style="height: 4.5rem;">
              <div class="with-left-sidebar">
              	<div class="[ m:display-none ] pad-h-l pad-v-m">
                  <img src="/images/svg/logo-light.svg" height=30 alt="Logo desktop view">
                </div>
              	<div class="row gap-m main-axis-space-between cross-axis-center pad-m">
              	  <div class="row gap-d-sm-m cross-axis-center">
                    <img class="[ md:display-none ]" src="images/svg/logo-mobile.svg" alt="Logo mobile view">
              	    <h2 class="clr-n-900-000 fw-bold fs-d-300-900">${board.name}</h2>
                    <button class="[ md:display-none ] dropdown-list-toggle-btn"
                            aria-controls="dropdown_list"
                            aria-expanded="false"
                            aria-label="Dropdown list toggle button">
                      <img src="images/svg/icon-chevron-down.svg" width="15" alt="Icon chevron down">
                    </button>
                    <button class="[ m:display-none ] transparent pad-sm border-radius-sm" title="Edit board" aria-label="Edit board"><img src="images/svg/icon-edit.svg" alt=""></button>
                    ${deleteBoardBtn}
              	  </div>
                  <div class="row gap-d-sm-m cross-axis-center">
              	    <button class="[ m:display-none ] fw-bold fs-d-300-500 clr-n-000 bg-p-purple pad-h-m pad-v-sm border-radius-l">+ Add New Task</button>
                    ${deleteUserBtn}
                    <button class="[ relative ] transparent pad-sm border-radius-sm" title="Sign out" aria-label="Sign out"><img src="images/svg/icon-exit.svg" alt=""></button>
                  </div>
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
    if (!dropdownListToggleBtn) throw new Error(".dropdown-list-toggle-btn is missing");
    dropdownListToggleBtn.addEventListener("click", async function() {
      const dropdownList = document.querySelector("#dropdown_list");
      if (!dropdownList) throw new Error(`#dropdown-list is missing`);

      dropdownList.classList.toggle("m:display-none");
      if (this.getAttribute("aria-expanded") === "true") {
	this.setAttribute("aria-expanded", "false");
	document.querySelector(`[data-prefix="backdrop"]`)?.remove(); // remove backdrop
      } else {
	this.setAttribute("aria-expanded", "true");
	const backdrop = document.createElement("div"); // create backdrop
	backdrop.classList.add("md:display-none");
	backdrop.setAttribute("data-prefix", "backdrop");
	backdrop.setAttribute("style", "background: rgba(0,0,0,0.5); position: fixed; width: 100%; height: 100%");
	const { Board } = await import("./board.js");
	document.querySelector(`[data-prefix="${Board.prefix}"]`)?.appendChild(backdrop);
      }
    });

    // btn "Edit board"
    component.querySelectorAll("button")[1].addEventListener("click", async () => {
      const { EditBoardDialog } = await import("./edit_board_dialog.js");
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

    // btn "Signout" in "anon" mode or "Delete user" in "auth" mode
    component.querySelectorAll("button")[4].addEventListener("click", async function() {
      if (globalThis.client_variables.is_anonymous) {
	const img = this.querySelector("img");
	if (!img) throw new Error("Signout btn <img> is missing");

	const { LoaderRipple } = await import("../../_shared/components/loader_ripple.js");
	const loader = LoaderRipple.init();
	loader.setAttribute("style", "--size: 20px; position: relative;");
	this.replaceChildren(loader);

	try {
	  await signout();  
	} catch (error) {
	  this.replaceChildren(img);  
	}	
      }
      if (!globalThis.client_variables.is_anonymous) {
	const { DeleteUserDialog } = await import("../components/delete_user_dialog.js");
	const dialog = DeleteUserDialog.init();
	document.querySelector("body")?.appendChild(dialog);
	// @ts-ignore
	dialog.showModal();
      }
    });

    // btn "Signout" in "auth" mode
    component.querySelectorAll("button")[5]?.addEventListener("click", async function() {
      const img = this.querySelector("img");
      if (!img) throw new Error("Signout btn <img> is missing");
      
      const { LoaderRipple } = await import("../../_shared/components/loader_ripple.js");
      const loader = LoaderRipple.init();
      loader.setAttribute("style", "--size: 20px; position: relative;");
      this.replaceChildren(loader);

      try {
	await signout();  
      } catch (error) {
	this.replaceChildren(img);  
      }
    });

    // *** ADDITIONAL LISTENERS ***

    component.addEventListener("board:selected", (event) => {
      /** @type {import("./board.js").BoardType} */
      // @ts-ignore
      const board = event.detail;
      updateName(board.name);

      console.log("board:selected");
    });

    component.addEventListener("board:created", (event) => {
      /** @type {import("./board.js").BoardType} */
      // @ts-ignore
      const board = event.detail;
      updateName(board.name);
      updateBoardBtnDisabledStatus();

      console.log("board:created");
    });

    component.addEventListener("board:updated", (event) => {
      /** @type {import("./board.js").BoardType} */
      // @ts-ignore
      const board = event.detail;
      updateName(board.name);

      console.log("board:updated");
    });

    component.addEventListener("board:deleted", () => {
      updateBoardBtnDisabledStatus();

      console.log("board:deleted");
    });

    // *** ADDITIONAL FUNCTIONS ***

    /** @param {string} name */
    function updateName(name) {
      const h2 = component.querySelector("h2");
      if (!h2) throw new Error(`<h2> is missing`);

      h2.textContent = name;
    }

    function updateBoardBtnDisabledStatus() {
      const boardsList     = document.querySelector(`[data-prefix="${BoardsList.prefix}"] > ul`);
      const deleteBoardBtn = component.querySelectorAll("button")[2];
      if (!deleteBoardBtn) throw new Error(`deleteBoardBtn is missing`);
      if (!boardsList)     throw new Error(`[data-prefix="${BoardsList.prefix}"] > <ul> is missing`);

      const btnImage = deleteBoardBtn.querySelector("img");
      if (!btnImage) throw new Error(`deleteBoardBtn <img> is missing`);

      if (boardsList.children.length > 1) {
	deleteBoardBtn.removeAttribute("disabled");
	btnImage.src = "images/svg/icon-delete.svg";
      } else {
	deleteBoardBtn.setAttribute("disabled", "");
	btnImage.src = "images/svg/icon-delete-gray.svg";
      }
    }

    /**
     * Implements procedure of signout.
     *
     * @throws {Error} Throws an error is response.status !== 204
     * @returns {Promise<void>}
     */
    async function signout() {
      const url     = "/v1/signout";
      const options = { method: "POST" };

      // [Errors 401, 500] [Success 204]
      const response = await fetch(url, options);

      if (response.status === 401) {
	const { openAuthzDialog } = await import("../functions.js");
	await openAuthzDialog();

	throw new Error("Unauthorized");
      }

      if (response.status !== 204) {
	const { openPopUp } = await import("../../_shared/functions.js");
	openPopUp("Server error", "Something went wrong. Try again.");

	throw new Error("Server error");
      }

      window.location.replace("/auth");
    }
  }
}
