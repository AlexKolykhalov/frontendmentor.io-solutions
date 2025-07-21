// @ts-check

import { EditBoardDialog } from "./edit_board_dialog.js";
import { EditTaskDialog } from "./edit_task_dialog.js";
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

    return `<li id="${DynamicListItem.prefix}-${inputID}" class="row cross-axis-center no-wrap">
              <label class="sr-only" for="x-${inputID}">Dynamic list item ${inputID}</label>
              <input class="[ flex-1 ] pad-sm fs-300 fw-medium clr-n-900-000 bg-n-100-900" id="x-${inputID}" value="${inputValue}" placeholder="${inputPlaceholder}"">
              <button class="close-btn" aria-label="remove"${deleteBtnDisabled ? " disabled" : ""}></button>
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
      const editBoardDialog = document.querySelector(`#${EditBoardDialog.prefix}`);
      const editTaskDialog  = document.querySelector(`#${EditTaskDialog.prefix}`);

      if (editBoardDialog) emit("dynamic-list-item:change", {}, editBoardDialog);
      if (editTaskDialog)  emit("dynamic-list-item:change", {}, editTaskDialog);

      this.removeAttribute("style");
    });

    removeBtn.addEventListener("click", function() {
      const listOfItems = removeBtn.closest("ul");      
      if (!listOfItems) throw new Error("Can't find <ul>");

      const dynamicList = listOfItems.parentElement;
      if (!dynamicList) throw new Error("Can't find parent element for <ul>");

      component.remove();
      emit("dynamic-list-item:remove", {}, dynamicList);
      const editBoardDialog = document.querySelector(`#${EditBoardDialog.prefix}`);
      const editTaskDialog  = document.querySelector(`#${EditTaskDialog.prefix}`);
      if (editBoardDialog) emit("dynamic-list-item:remove", {}, editBoardDialog);
      if (editTaskDialog)  emit("dynamic-list-item:remove", {}, editTaskDialog);
    });
  }
}
