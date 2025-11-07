// @ts-check

import { EditBoardDialog } from "./edit_board_dialog.js";
import { EditTaskDialog } from "./edit_task_dialog.js";
import { generateRandomSymbols, emit } from "./_helpers.js"

/**
 * @typedef {object} DynamicListItemType
 * @property {string}  [id]                By default random 4 symbols.
 * @property {string}  [value]             By default "".
 * @property {string}  [placeholder]       By default "dynamic listitem".
 * @property {boolean} [deleteBtnDisabled] By default "false".
 */

export class DynamicListItem {
  /**
   * @param {DynamicListItemType} [props]
   *
   * @returns {string} HTML string
   */
  static #template(props) {
    const id          = props ? props.id ?? generateRandomSymbols(4) : generateRandomSymbols(4);
    const value       = props ? props.value ?? "" : "";
    const placeholder = props ? props.placeholder ?? "dynamic listitem" : "dynamic listitem";
    const disabled    = props ? props.deleteBtnDisabled ?? false : false;

    return `<li id="dli-${id}" class="row cross-axis-center no-wrap">
              <label class="sr-only" for="x-${id}">Dynamic list item ${id}</label>
              <input class="[ flex-1 ] pad-sm fs-300 fw-medium clr-n-900-000 bg-n-100-900" id="x-${id}" value="${value}" placeholder="${placeholder}"">
              <button class="close-btn" aria-label="remove" ${disabled ? "disabled" : ""}></button>
            </li>`;
  }

  /**
   * @param {DynamicListItemType} [props]
   *
   * @returns {Element}
   */
  static init(props) {
    return this.#create(props);
  }

  /**
   * @param {DynamicListItemType} [props]
   *
   * @returns {Element}
   */
  static #create(props) {
    const template     = document.createElement("template");
    template.innerHTML = this.#template(props);
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error("Can't create \"DynamicListItem\" component");

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

    if (!input)     throw new Error("Can't find <input>");
    if (!removeBtn) throw new Error("Can't find <button>");

    input.addEventListener("input", function() {
      const editBoardDialog = document.querySelector(`#${EditBoardDialog.prefix}`);
      const editTaskDialog  = document.querySelector(`#${EditTaskDialog.prefix}`);

      if (editBoardDialog) emit("dynamic-list-item:changed", {}, editBoardDialog);
      if (editTaskDialog)  emit("dynamic-list-item:changed", {}, editTaskDialog);

      this.removeAttribute("style");
    });

    removeBtn.addEventListener("click", function() {
      const listOfItems = removeBtn.closest("ul");
      if (!listOfItems) throw new Error("Can't find <ul>");

      const dynamicList = listOfItems.parentElement;
      if (!dynamicList) throw new Error("Can't find parent element for <ul>");

      component.remove();
      emit("dynamic-list-item:removed", {}, dynamicList);
      const editBoardDialog = document.querySelector(`#${EditBoardDialog.prefix}`);
      const editTaskDialog  = document.querySelector(`#${EditTaskDialog.prefix}`);
      if (editBoardDialog) emit("dynamic-list-item:removed", {}, editBoardDialog);
      if (editTaskDialog)  emit("dynamic-list-item:removed", {}, editTaskDialog);
    });
  }
}
