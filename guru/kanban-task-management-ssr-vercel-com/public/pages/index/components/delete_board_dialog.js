// @ts-check

import { BoardsList } from "./boards_list.js";
import { BoardsListItem } from "./boards_list_item.js";
import { MainHeader } from "./main_header.js";
import { emit } from "./helpers.js";

export class DeleteBoardDialog {
  /** @returns {string} HTML string */
  static template() {
    const title = document.querySelector(`#${MainHeader.prefix} h2`);
    return `<dialog class="bg-n-000-800">
              <div class="column gap-l">
                <div class="row gap-m main-axis-space-between">
                  <h2 class="fs-900 clr-n-900-000">Delete this board?</h2>
                  <button class="close-btn" aria-label="close"></button>
                </div>
                <p class="fs-300 clr-n-600">Are you sure you want to delete the <strong class="clr-n-900-000">"${title?.textContent}"</strong> board? This action will remove all columns and tasks and cannot be reversed.</p>
                <div class="row gap-l main-axis-end">
                  <button class="fw-bold fs-300 pad-h-m clr-n-000 pad-v-sm border-radius-l bg-p-red">Delete</button>
                </div>
              </div>
            </dialog>`;
  }

  /** @returns { Element } */
  static init() {
    return DeleteBoardDialog.#create();
  }

  /**
   * @returns {Element}
   */
  static #create() {
    const template     = document.createElement("template");
    template.innerHTML = DeleteBoardDialog.template();
    const component    = template.content.firstElementChild;
    if (!component) throw new Error("Can't create \"EditBoardDialog\" component");

    DeleteBoardDialog.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static handleEvents(component) {
    // delete btn
    component.querySelectorAll("button")[1].addEventListener("click", async function() {
      const boardsList = document.querySelector(`#${BoardsList.prefix}`);
      if (!boardsList) throw new Error(`Can't find <article id="${BoardsList.prefix}">`);
      const selectedBoardsListItem = document.querySelector(`#${BoardsList.prefix} ul > li.selected`);
      if (!selectedBoardsListItem) throw new Error(`Missing selected boards list item`);
      const selectedItemIdAttribute = selectedBoardsListItem.getAttribute("id");
      if (!selectedItemIdAttribute) throw new Error(`Missing ID attribute of the selected boards list item`);

      const boardID = selectedItemIdAttribute.slice(`${BoardsListItem.prefix}-`.length);

      const response = await fetch(
	`http://localhost:4000/rpc/delete_board`,
	{
	  method: "POST",
	  headers: {
	    "Content-Type": "application/json",
	    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYXV0aF91c2VyIn0.XC5n_hafVOMV1Ve7S2_5A0K5TmWURd_Q-zsoZgBFUTo",
	  },
	  body: JSON.stringify({ p_id: boardID }),
	}
      );

      if (response.status === 401) throw new Error("Authentication error");
      if (response.status !== 204) throw new Error("Unexpected response status");

      // remove deleted element from the "Boards list"
      emit("board:deleted", boardID, boardsList);
      component.remove();
    });

    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error("Can't find <button aria-label=\"close\">");
    closeDialogBtn.addEventListener("click", () => component.remove());
  }
}
