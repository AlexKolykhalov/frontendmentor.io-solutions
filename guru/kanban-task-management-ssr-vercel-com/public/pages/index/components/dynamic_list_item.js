// @ts-check

import { generateRandomSymbols, emit } from "./helpers.js"

/**
 * @typedef {object} Props
 * @property {string} [value]
 * @property {string} [placeholder]
 * @property {boolean} [disabled] - Disables the button (by default "false").
 */

export class DynamicListItem {
  /**
   * @param {Props} [props]
   * @returns {string} HTML string
   */
  static template(props = {}) {
    const { value = "", placeholder = "e.g. some text", disabled = false } = props;
    const id = `x-${generateRandomSymbols(4)}`;

    return `<li class="row main-axis-space-between">
              <div class="column">
                <label class="sr-only" for="${id}">Column ${id}</label>
                <input id="${id}" value="${value}" placeholder="${placeholder}">
              </div>
              <button aria-label="remove"${disabled ? " disabled" : ""}>
                <img src="/images/svg/icon-cross.svg" alt="">
              </button>
            </li>`;
  }

  /**
   * @param {Props} [props]
   * @returns {Element}
   */
  static init(props = {}) {
    return DynamicListItem.#create(props);
  }

  /**
   * @param {Props} props
   * @returns {Element}
   */
  static #create(props) {
    const template     = document.createElement("template");
    template.innerHTML = DynamicListItem.template(props);
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error("Can't create \"DynamicListItem\" component");

    DynamicListItem.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static handleEvents(component) {
    const input     = component.querySelector("input");
    const removeBtn = component.querySelector("button");

    if (!input)     throw new Error("Can't find <input>");
    if (!removeBtn) throw new Error("Can't find <button>");

    input.addEventListener("input", function() {
      const dialog = document.querySelector("dialog");
      if (!dialog) throw new Error("Can't find <dialog>");

      this.removeAttribute("style");
      emit("dynamic-list-item:change", {}, dialog);
    });

    removeBtn.addEventListener("click", function() {
      const dialog = document.querySelector("dialog");
      const listOfItems = removeBtn.closest("ul");
      if (!dialog) throw new Error("Can't find <dialog>");
      if (!listOfItems) throw new Error("Can't find <ul>");

      const parentComponent = listOfItems.parentElement;
      if (!parentComponent) throw new Error("Can't find parent element for <ul>");

      component.remove();
      emit("dynamic-list-item:remove", {}, parentComponent);
      emit("dynamic-list-item:remove", {}, dialog);
    });
  }
}

