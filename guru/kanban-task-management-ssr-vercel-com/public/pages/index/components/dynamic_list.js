// @ts-check

import { injectEvents }    from "../js/inject.js";
import { DynamicListItem } from "./dynamic_list_item.js";
import { emit }            from "./helpers.js";

/**
 * @typedef {object} DynamicListType
 * @property {string} [title] Title of the dynamic list
 * @property {import("./dynamic_list_item.js").DynamicListItemType[]} items
 * @property {string} [btnText]
 * @property {number} [limit]
 */

export class DynamicList {
  /**
   * @param {DynamicListType} [props]
   * @returns {string} - HTML string
   */
  static template(props = { items: [] }) {
    const { title = "", items, btnText = "Add new item", limit = 10 } = props;
    return `<div class="column gap-sm">
              <p>${title}</p>
              <ul class="column gap-sm">
                ${items.map(item => DynamicListItem.template({
                    inputID: item.inputID,
                    inputValue: item.inputValue,
                    inputPlaceholder: item.inputPlaceholder,
                    deleteBtnDisabled: item.deleteBtnDisabled})).join("")}
              </ul>
              <button>${btnText} <span>(${limit - items.length})</span></button>
            </div>`;
  }

  /**
   * @param {DynamicListType} [props]
   * @throws {Error} - Will throw an error if the "limit" if not integer or is not greater than 1
   * @returns {Element}
   */
  static init(props = { items: [] }) {
    const { limit = 10 } = props;
    if (!Number.isInteger(limit)) throw new Error("Limit must be integer");
    if (limit < 2)                throw new Error("Limit must be greater than 1");

    const component = DynamicList.#create(props);
    injectEvents(component); // adds events for children (DynamicListItem)

    return component;
  }

  /**
   * @param {DynamicListType} props
   * @returns {Element}
   */
  static #create(props) {
    const template     = document.createElement("template");
    template.innerHTML = DynamicList.template(props);
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error("Can't create \"DynamicList\" component");

    DynamicList.handleEvents(component, props);

    return component;
  }

  /**
   * @param {Element} component
   * @param {DynamicListType} [props]
   *
   * @returns {void}
   */
  static handleEvents(component, props = { items: [] }) {
    const { items, limit = 10 } = props;
    
    const ul = component.querySelector("ul");
    if (!ul) throw new Error("Can't find <ul>");
    
    const addNewColumnBtn = component.querySelector(":scope > button");
    if (!addNewColumnBtn) throw new Error("Can't find <button>");
    addNewColumnBtn.addEventListener("click", function() {
      ul.querySelector("button[disabled]")?.removeAttribute("disabled");
      ul.appendChild( // adding default item
	DynamicListItem.init({inputPlaceholder: items[0] ? items[0].inputPlaceholder : "e.g. some text"})
      );
      this.querySelector("span").textContent = (limit - [...ul.children].length) > 0 ?
	`(${limit - [...ul.children].length})` :
	"";
      if (limit - [...ul.children].length === 0) this.setAttribute("disabled", "");

      const dialog = document.querySelector("dialog");
      if (!dialog) throw new Error("Can't find <dialog>");

      emit("dynamic-list-item:add", {}, dialog);
    });

    component.addEventListener("dynamic-list-item:remove", () => {
      const span = addNewColumnBtn.querySelector("span");
      if (!span) throw new Error("Missing <span>");

      span.textContent = `(${limit - [...ul.children].length})`;
      if ([...ul.children].length === limit - 1) addNewColumnBtn.removeAttribute("disabled");
      if (items.length > 0 && [...ul.children].length === 1)
	ul.querySelectorAll("button").forEach(item => item.setAttribute("disabled", ""));
    });
  }
}
