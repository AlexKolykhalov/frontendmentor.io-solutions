// @ts-check

import { BoardsList }               from "./boards_list.js";
import { BoardsListItem }           from "./boards_list_item.js";
import { MainHeader }               from "./main_header.js";
import { emit, openRedirectDialog } from "./_helpers.js";

export class DeleteBoardDialog {
  /** @returns {string} HTML string */
  static #template() {
    const title = document.querySelector(`#${MainHeader.prefix} h2`);
    
    return `<dialog class="bg-n-000-800">
              <div class="column gap-l">
                <div class="row gap-m main-axis-space-between">
                  <h2 class="fs-900 clr-n-900-000">Delete this board?</h2>
                  <button class="close-btn" aria-label="close"></button>
                </div>
                <p class="fs-300 clr-n-600">Are you sure you want to delete the <strong class="clr-n-900-000">"${title?.textContent}"</strong> board? This action will remove all columns and tasks and cannot be reversed.</p>
                <div class="row gap-l main-axis-end">
                  <button class="[ relative ] fw-bold fs-300 pad-h-l clr-n-000 pad-v-sm border-radius-l bg-p-red">Delete</button>
                </div>
              </div>
            </dialog>`;
  }

  /** @returns { Element } */
  static init() {
    return this.#create();
  }

  /**
   * @returns {Element}
   */
  static #create() {
    const template     = document.createElement("template");
    template.innerHTML = this.#template();
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error("Can't create \"DeleteBoardDialog\" component");

    this.#handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   *
   * @returns {void}
   */
  static #handleEvents(component) {
    // delete btn
    component.querySelectorAll("button")[1].addEventListener("click", async function() {
      const mainHeader = document.querySelector(`#${MainHeader.prefix}`);
      const boardsList = document.querySelector(`#${BoardsList.prefix}`);
      if (!mainHeader) throw new Error(`Missing <article id="${MainHeader.prefix}">`);
      if (!boardsList) throw new Error(`Missing <article id="${BoardsList.prefix}">`);
      const selectedBoardsListItem = document.querySelector(`#${BoardsList.prefix} ul > li.selected`);
      if (!selectedBoardsListItem) throw new Error(`Missing selected boards list item`);
      const selectedItemIdAttribute = selectedBoardsListItem.getAttribute("id");
      if (!selectedItemIdAttribute) throw new Error(`Missing ID attribute of the selected boards list item`);
      const boardID = selectedItemIdAttribute.slice(`${BoardsListItem.prefix}-`.length);

      if (globalThis.role === "anonymous") {
	emit("board:deleted", boardID, boardsList);
	emit("board:deleted", {}, mainHeader);
	component.remove();
	return;
      }

      this.setAttribute("disabled", "");
      // add indicator
      const { LoaderRipple } = await import("../../_shared/components/loader_ripple.js");
      const loader = LoaderRipple.init();
      loader.classList.add("clr-n-000");
      loader.setAttribute("style", "--size: 25px; right: 5%;");
      this.appendChild(loader);

      const url     = "http://localhost:4000/rpc/delete_board";
      const options = {
	method: "POST",
	headers: {
	  "Content-Type": "application/json",
	  "Authorization": `Bearer ${ localStorage.getItem("bearer") }`,
	},
	body: JSON.stringify({ p_id: boardID }),
      };
      // [Errors 401, 403] [Success 204]
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
	  this.removeAttribute("disabled");
	  loader.remove();

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
	this.removeAttribute("disabled");
	loader.remove();

	return;
      }

      // remove deleted element from the "Boards list"
      emit("board:deleted", boardID, boardsList);
      // update deleteBoardBtn disable status
      emit("board:deleted", {}, mainHeader);
      component.remove();
    });

    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error("Can't find <button aria-label=\"close\">");
    closeDialogBtn.addEventListener("click", () => component.remove());
  }
}
