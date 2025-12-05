// @ts-check

import { MainHeader } from "./main_header.js";

export class DeleteBoardDialog {
  /** @returns {string} HTML string */
  static #template() {
    const title = document.querySelector(`[data-prefix="${MainHeader.prefix}"] h2`);

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

  /** @returns {Element} */
  static #create() {
    const template     = document.createElement("template");
    template.innerHTML = this.#template();
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error(`Can't create ${this.name} component`);

    this.#handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static #handleEvents(component) {
    // delete btn
    component.querySelectorAll("button")[1].addEventListener("click", async function() {
      const { BoardsList }     = await import("./boards_list.js");
      const { BoardsListItem } = await import("./boards_list_item.js");
      const mainHeader = document.querySelector(`[data-prefix="${MainHeader.prefix}"]`);
      const boardsList = document.querySelector(`[data-prefix="${BoardsList.prefix}"]`);
      if (!mainHeader) throw new Error(`[data-prefix="${MainHeader.prefix}"] is missing`);
      if (!boardsList) throw new Error(`[data-prefix="${BoardsList.prefix}"] is missing`);

      const boardID = boardsList.querySelector(`ul > li.selected`)?.getAttribute("data-id");
      if (!boardID) throw new Error(`${BoardsListItem.prefix} [data-id] is missing`);

      if (globalThis.client_variables.is_anonymous) {
	component.remove();
	[boardsList, mainHeader].forEach(item => {
	  item.dispatchEvent(new CustomEvent("board:deleted", { detail: boardID }));
	})

	return;
      }

      this.setAttribute("disabled", ""); // disable deleteBtn
      // add indicator
      const { LoaderRipple } = await import("../../_shared/components/loader_ripple.js");
      const loader = LoaderRipple.init();
      loader.classList.add("clr-n-000");
      loader.setAttribute("style", "--size: 25px; right: 5%;");
      this.appendChild(loader);

      const url     = `/v1/boards/${boardID}`;
      const options = {
	method: "DELETE",
	headers: { "Authorization": `Bearer ${ localStorage.getItem("bearer") }` }
      };
      // [Errors 401, 403, 404, 405, 500] [Success 204]
      let response = await fetch(url, options);

      if (response.status === 401) {
	const responseBearer = await fetch("/v1/bearers/generate", { method: "POST" });

	if (responseBearer.status !== 201) {
	  if (responseBearer.status === 401) {
	    const { openSessionExpiredDialog } = await import("../functions.js");
	    await openSessionExpiredDialog();
	  } else {
	    const { openPopUp } = await import("../../_shared/functions.js");
	    await openPopUp("Authentication token error", "Something went wrong. Try again.");
	  }

	  component.remove(); // close this dialog

	  return;
	}

	const bearer = await responseBearer.json();

	localStorage.setItem("bearer", bearer);
	options.headers.Authorization = `Bearer ${ bearer }`;
	response = await fetch(url, options);
      }

      if (response.status === 403) {
	const { openAuthzDialog } = await import("../functions.js");
	await openAuthzDialog();

	component.remove(); // close this dialog

	return;
      }

      if (response.status === 404 || response.status !== 204) {
	const { openPopUp } = await import("../../_shared/functions.js");
	await openPopUp(
	  response.status === 404 ? "Search error" : "Server error",
	  response.status === 404 ? "Board not found" : "Something went wrong. Try again"
	);

	component.remove(); // close this dialog

	return;
      };

      component.remove(); // close this dialog

      [boardsList, mainHeader].forEach(item => {
	item.dispatchEvent(new CustomEvent("board:deleted", { detail: boardID }))
      });
    });

    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error(`<button aria-label="close"> is missing`);
    closeDialogBtn.addEventListener("click", () => component.remove());
  }
}
