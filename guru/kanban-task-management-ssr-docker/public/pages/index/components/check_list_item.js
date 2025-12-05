// @ts-check

import { generateRandomSymbols } from "../functions.js";

/**
 * @typedef  {object} CheckListItemType
 *
 * @property {string}  id
 * @property {string}  value
 * @property {boolean} checked
 */

export class CheckListItem {
  /**
   * @param {CheckListItemType} props
   * @returns {string} HTML string
   */
  static #template(props) {
    const id = generateRandomSymbols(4);

    return `<li class="[ relative ] fw-bold fs-200 clr-n-900-000 bg-n-100-900 bg-p-light-purple:hover" data-id="${props.id}">
              <label for="${id}" class="row no-wrap gap-sm cross-axis-center pad-sm cursor-pointer">
                <input id="${id}" type="checkbox" ${props.checked ? "checked" : ""}>${props.value}
              </label>
            </li>`;
  }

  /**
   * @param {CheckListItemType} props
   * @returns {Element}
   */
  static init(props) {
    return this.#create(props);
  }

  /**
   * @param {CheckListItemType} props
   * @returns {Element}
   */
  static #create(props) {
    const template     = document.createElement("template");
    template.innerHTML = this.#template(props);
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
    const input = component.querySelector("input");
    if (!input) throw new Error("<input> is missing");
    input.addEventListener("click", async function() {
      if (this.hasAttribute("disabled")) return; // multi-click protection

      if (globalThis.client_variables.is_anonymous) {
	Reflect.set(this, "checked", !this.checked); // returns previous value
	const { openAuthzDialog } = await import("../functions.js");
	openAuthzDialog();

	return;
      }

      component.querySelector("label")?.classList.remove("cursor-pointer");
      this.setAttribute("disabled", ""); // disable clicks
      // add indicator
      const { LoaderRipple } = await import("../../_shared/components/loader_ripple.js");
      const loader = LoaderRipple.init();
      loader.setAttribute("style", "--size: 25px; right: 2.5%;");
      component.appendChild(loader);

      const subtaskID = component.getAttribute("data-id");
      if (!subtaskID) throw new Error(`[data-id] is missing`);

      const url     = `/v1/subtasks/${subtaskID}`;
      const options = {
	method: "PATCH",
	headers: {
	  "Content-Type": "application/json",
	  "Authorization": `Bearer ${ localStorage.getItem("bearer") }`,
	},
	body: JSON.stringify({ isCompleted: this.checked }),
      };

      // [Errors 401, 403, 404, 405, 500] [Success 200]
      let response = await fetch(url, options);

      if (response.status === 401) {
	// [Errors 400, 401, 500] [Success 201]
	const responseBearer = await fetch("/v1/bearers/generate", { method: "POST" });

	if (responseBearer.status !== 201) {
	  // close the dialog
	  component.dispatchEvent( new CustomEvent("check-list-item:error", { bubbles: true }));

	  if (responseBearer.status === 401) {
	    const { openSessionExpiredDialog } = await import("../functions.js");
	    await openSessionExpiredDialog();
	  } else {
	    const { openPopUp } = await import("../../_shared/functions.js");
	    await openPopUp("Authentication token error", "Something went wrong. Try again.");
	  }

	  return;
	}

	const bearer = await responseBearer.json();

	localStorage.setItem("bearer", bearer);
	options.headers.Authorization = `Bearer ${ bearer }`;
	response = await fetch(url, options);
      };

      if (response.status !== 200) {
	// close the dialog
	component.dispatchEvent( new CustomEvent("check-list-item:error", { bubbles: true }));

	if (response.status === 403) {
	  const { openAuthzDialog } = await import("../functions.js");
	  await openAuthzDialog();
	} else { // 404 or 500
	  const { openPopUp } = await import("../../_shared/functions.js");
	  await openPopUp(
	    response.status === 404 ? "Search error" : "Server error",
	    response.status === 404 ? "Subtask not found" : "Something went wrong. Try again"
	  );
	}

	return;
      }

      component.querySelector("label")?.classList.add("cursor-pointer");
      this.removeAttribute("disabled"); // enabled clicks

      loader.remove();

      const subtask = await response.json();
      component.dispatchEvent(
	// listen to CheckList & TaskDialog
	new CustomEvent("check-list-item:changed", { detail: subtask, bubbles: true })
      );
    });
  }
}
