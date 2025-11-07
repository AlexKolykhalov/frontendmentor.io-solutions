// @ts-check

import { CheckListItem } from "./check_list_item.js";

/**
 * @typedef  {object}                                             CheckListType
 * @property {string}                                             title
 * @property {import("./check_list_item.js").CheckListItemType[]} items
 */

export class CheckList { // listens to [check-list-item:changed]
  /**
   * @param {CheckListType} props
   * @returns {string} HTML string
   */
  static #template(props) {
    return `<div class="column gap-sm">
              <p class="fw-bold fs-200 clr-n-600 letter-spacing-m">${props.title} (${props.items.filter(item => item.checked).length} of ${props.items.length})</p>
              <ul class="column gap-sm">
                <check-list-items></check-list-items>
              </ul>
            </div>`;
  }

  /**
   * @param {CheckListType} props
   * @returns {Element}
   */
  static init(props) {
    const component      = this.#create(props);
    const fragment       = document.createDocumentFragment();
    const checkListItems = component.querySelector("check-list-items");
    if (!checkListItems) throw new Error("<check-list-items> is missing");

    props.items.forEach(item => {
      fragment.appendChild(
	CheckListItem.init({ id: item.id, value: item.value, checked: item.checked })
      );
    });
    checkListItems.replaceWith(fragment);

    return component;
  }

  /**
   * @param {CheckListType} props
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
    component.addEventListener("check-list-item:changed", () => {
      const titleElement = component.querySelector("p");
      if (!titleElement) throw new Error("<p> is missing");

      const allCheckboxes     = [...component.querySelectorAll("input")];
      const checkedCheckboxes = allCheckboxes.filter(input => input.checked);
      const title = titleElement.textContent?.slice(0, titleElement.textContent.lastIndexOf("(")).trim();
      titleElement.textContent=`${title} (${checkedCheckboxes.length} of ${allCheckboxes.length})`;
    });
  }
}
