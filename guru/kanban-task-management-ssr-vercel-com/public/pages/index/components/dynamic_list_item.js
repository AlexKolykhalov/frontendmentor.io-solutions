// @ts-check

import { generateRandomSymbols } from "../functions.js";

/**
 * @typedef {object} DynamicListItemType
 * @property {string}  [id]                By default random 4 symbols.
 * @property {string}  [value]             By default "".
 * @property {string}  [placeholder]       By default "dynamic listitem".
 * @property {boolean} [deleteBtnDisabled] By default "false".
 */

export class DynamicListItem {
  /**
   * @param {DynamicListItemType} props
   * @returns {string} HTML string
   */
  static #template(props) {
    const id          = generateRandomSymbols(4);
    const value       = props.value ?? "";
    const placeholder = props.placeholder ?? "dynamic listitem";
    const disabled    = props.deleteBtnDisabled ?? false;

    return `<li class="row cross-axis-center no-wrap">
              <label class="sr-only" for="${id}">Dynamic list item ${id}</label>
              <input class="[ flex-1 ] pad-sm fs-300 fw-medium clr-n-900-000 bg-n-100-900" id="${id}" value="${value}" placeholder="${placeholder}" ${props.id ? `data-id="${props.id}"` : ""}>
              <button class="close-btn" aria-label="remove" ${disabled ? "disabled" : ""}></button>
            </li>`;
  }

  /**
   * @param {DynamicListItemType} props
   * @returns {Element}
   */
  static init(props) {
    return this.#create(props);
  }

  /**
   * @param {DynamicListItemType} props
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
    const input     = component.querySelector("input");
    const removeBtn = component.querySelector("button");
    if (!input)     throw new Error("<input> is missing");
    if (!removeBtn) throw new Error("<button> is missing");

    input.addEventListener("input", function() {
      this.removeAttribute("style");
      // listens to EditBoardDialog or EditTaskDialog
      component.dispatchEvent(new CustomEvent("dynamic-list-item:changed", { bubbles: true }));

      console.log("dynamic-list-item:changed");
    });

    removeBtn.addEventListener("click", () => {
      const parent = component.parentElement;
      if (!parent) throw new Error("Parent component is missing");

      component.remove();
      // listens to DynamicList and EditBoardDialog or EditTaskDialog
      parent.dispatchEvent(new CustomEvent("dynamic-list-item:removed", { bubbles: true }));

      console.log("dynamic-list-item:removed");
    });
  }
}
