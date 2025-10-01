// @ts-check

import { Board }              from "./board.js";
import { BoardsList }         from "./boards_list.js";
import { openRedirectDialog } from "./_helpers.js";

// listens to [board:selected, created, updated, deleted]
export class MainHeader {

  static prefix   = "main_header"; // using in add_new_board_dialog.js
  static selector = `#${this.prefix}`;

  /**
   * @param {import("./board.js").BoardType} board
   *
   * @returns {string} HTML string
   */
  static template(board) {
    const deleteBoardBtn = globalThis.boardsList.length === 1 ?
	  `<button class="[ m:display-none ] transparent pad-sm border-radius-sm" title="Delete board" aria-label="Delete board"><img src="images/svg/icon-delete-gray.svg" alt=""></button>` :
	  `<button class="[ m:display-none ] transparent pad-sm border-radius-sm" title="Delete board" aria-label="Delete board"><img src="images/svg/icon-delete.svg" alt=""></button>`;
    const deleteUserBtn = globalThis.role === "auth" ?
	  `<button class="transparent pad-sm border-radius-sm" title="Delete user" aria-label="Delete user"><img src="images/svg/icon-user-delete.svg" alt=""></button>` :
	  "";
    const path = `data-path="http://localhost:3000/pages/index/components/main_header.js"`;

    return `<header id="${this.prefix}" class="bg-n-000-800" style="height: 4.5rem;" ${path}>
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
                      <img src="images/svg/icon-chevron-down.svg" alt="Icon chevron down">
                    </button>
                    <button class="[ m:display-none ] transparent pad-sm border-radius-sm" title="Edit board" aria-label="Edit board"><img src="images/svg/icon-edit.svg" alt=""></button>
                    ${deleteBoardBtn}
              	  </div>
                  <div class="row gap-d-sm-m cross-axis-center">
              	    <button class="[ m:display-none ] fw-bold fs-d-300-500 clr-n-000 bg-p-purple pad-h-m pad-v-sm border-radius-l">+ Add New Task</button>
                    ${deleteUserBtn}
                    <button class="transparent pad-sm border-radius-sm" title="Sign out" aria-label="Sign out"><img src="images/svg/icon-exit.svg" alt=""></button>
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

    // btn "Signout" in "anon" mode or "Delete user" in "auth" mode
    component.querySelectorAll("button")[4].addEventListener("click", async () => {
      if (globalThis.role === "auth") {
	const { DeleteUserDialog } = await import("../components/delete_user_dialog.js");
	const dialog = DeleteUserDialog.init();
	document.querySelector("body")?.appendChild(dialog);
	// @ts-ignore
	dialog.showModal();
      }
      if (globalThis.role === "anonymous") await signout();
    });

    // btn "Signout" in "auth" mode
    component.querySelectorAll("button")[5]?.addEventListener("click", async () => {
      await signout();
    });

    // ***ADDITIONAL LISTENERS***

    component.addEventListener("board:selected", (event) => {
      // @ts-ignore
      updateName(event.detail.name);

      console.log("board:selected");
    });

    component.addEventListener("board:created", (event) => {
      // @ts-ignore
      updateName(event.detail.name);
      updateBoardBtnDisabledStatus();

      console.log("board:created");
    });

    component.addEventListener("board:updated", (event) => {
      // @ts-ignore
      updateName(event.detail.name);

      console.log("board:updated");
    });

    component.addEventListener("board:deleted", () => {
      updateBoardBtnDisabledStatus();

      console.log("board:deleted");
    });

    // ***ADDITIONAL FUNCTIONS***

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

    function updateBoardBtnDisabledStatus() {
      const deleteBoardBtn     = component.querySelectorAll("button")[2];
      const headerOfBoardsList = document.querySelector(`#${BoardsList.prefix} > header`);
      if (!deleteBoardBtn)     throw new Error(`Missing "deleteBoardBtn"`);
      if (!headerOfBoardsList) throw new Error(`Missing #${BoardsList.prefix} > header`);

      const textContent = headerOfBoardsList.textContent;
      const btnImage    = deleteBoardBtn.querySelector("img");
      if (!textContent) throw new Error(`Missing content of #${BoardsList.prefix} > header`);
      if (!btnImage)    throw new Error(`Missing deleteBoardBtn > img`);

      const countOfBoards = Number(textContent.slice(textContent.indexOf("(") + 1, textContent.indexOf(")")));
      if (countOfBoards > 1) {
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
     * @throws {Error} Throws an error
     * if authz_token could not be generating or response.status !== 204
     * @returns {Promise<void>}
     */
    async function signout() {
      const url     = "http://localhost:3000/api/signout";
      const options = {
	method: "POST",
	headers: {
	  "Content-Type": "application/json",
	  "Authorization": `Bearer ${ localStorage.getItem("bearer") }`,
	},
      };

      // [Errors 400, 401, 403, 500] [Success 204]
      let response = await fetch(url, options);

      if (response.status === 401) {
	const resAuthz = await fetch("http://localhost:3000/api/generate_authz_token", { method: "POST" });
	if (resAuthz.status === 401) {
	  await openRedirectDialog();

	  return;
	}

	if (resAuthz.status !== 201) {
	  const { PopUp } = await import("../../_shared/components/pop_up.js");
	  document.body.appendChild(
	    PopUp.init({
	      title: "Authentication token error",
	      message: "Something went wrong. Try again."
	    })
	  );

	  return;
	}

	localStorage.setItem("bearer", await resAuthz.json());
	options.headers.Authorization = `Bearer ${ localStorage.getItem("bearer") }`;
	response = await fetch(url, options);
      }

      if (response.status !== 204) {
	const { PopUp } = await import("../../_shared/components/pop_up.js");
	document.body.appendChild(
	  PopUp.init({
	    title: "Server error",
	    message: "Something went wrong. Try again."
	  })
	);

	return;
      }

      localStorage.removeItem("bearer");
      window.location.replace("/auth");
    }
  }
}
