// @ts-check

import { generateRandomSymbols, emit } from "./helpers.js"

/**
 * @typedef {object} DynamicListItemType
 * @property {string} [inputID]
 * @property {string} [inputValue]
 * @property {string} [inputPlaceholder]
 * @property {boolean} [deleteBtnDisabled] - Disables the button (by default "false").
 */

export class DynamicListItem {

  static prefix = "dynamic_list_item";

  /**
   * @param {DynamicListItemType} [props]
   * @returns {string} HTML string
   */
  static template(props = {}) {
    const {
      inputID           = generateRandomSymbols(4),
      inputValue        = "",
      inputPlaceholder  = "e.g. some text",
      deleteBtnDisabled = false } = props;

    return `<li id="${DynamicListItem.prefix}-${inputID}" class="row main-axis-space-between">
              <div class="column">
                <label class="sr-only" for="x-${inputID}">Dynamic list item ${inputID}</label>
                <input id="x-${inputID}" value="${inputValue}" placeholder="${inputPlaceholder}">
              </div>
              <button aria-label="remove"${deleteBtnDisabled ? " disabled" : ""}>
                <img src="/images/svg/icon-cross.svg" alt="">
              </button>
            </li>`;
  }

  /**
   * @param {DynamicListItemType} [props]
   * @returns {Element}
   */
  static init(props = {}) {
    return DynamicListItem.#create(props);
  }

  /**
   * @param {DynamicListItemType} props
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

      const dynamicList = listOfItems.parentElement;
      if (!dynamicList) throw new Error("Can't find parent element for <ul>");

      component.remove();
      emit("dynamic-list-item:remove", {}, dynamicList);
      emit("dynamic-list-item:remove", {}, dialog);
    });
  }
}
