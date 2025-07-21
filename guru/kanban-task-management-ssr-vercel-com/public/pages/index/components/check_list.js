// @ts-check

import { injectEvents }  from "../js/inject.js";
import { CheckListItem } from "./check_list_item.js";

/**
 * @typedef {object} CheckListType
 * @property {string} [title] Title of the check list
 * @property {import("./check_list_item").CheckListItemType[]} items
 */

export class CheckList {
  /**
   * @param {CheckListType} [props]
   *
   * @returns {string} - HTML string
   */
  static template(props = { items: [] }) {
    const { title = "Checkbox list", items } = props;
    return `<div class="column gap-sm">
              <p class="fw-bold fs-200 clr-n-600 letter-spacing-m">${title} (${items.filter(item => item.checked).length} of ${items.length})</p>
              <ul class="column gap-sm">
                ${items.map(item => CheckListItem.template({
                  id: item.id,
                  title: item.title,
                  checked: item.checked})).join("")}
              </ul>
            </div>`;
  }

  /**
   * @param {CheckListType} [props]
   *
   * @returns {Element}
   */
  static init(props = { items: [] }) {
    const component = CheckList.#create(props);
    injectEvents(component); // adds events for children (CheckListItem)
    
    return component;
  }

  /**
   * @param {CheckListType} props
   *
   * @returns {Element}
   */
  static #create(props) {
    const template     = document.createElement("template");
    template.innerHTML = CheckList.template(props);
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error("Can't create \"CheckList\" component");

    CheckList.handleEvents(component, props);

    return component;
  }

  /**
   * @param {Element} component
   * @param {CheckListType} [props]
   *
   * @returns {void}
   */
  static handleEvents(component, props = { items: [] }) {
    const { title, items } = props;

    component.addEventListener("check-list-item:change", () => {
      const titleElement = component.querySelector("p");
      if (!titleElement) throw new Error("Missing <p>");
      
      const checked = [...component.querySelectorAll("input")].filter(input => input.checked);
      titleElement.textContent=`${title} (${checked.length} of ${items.length})`;
    });
  }
}

