// @ts-check

import { generateRandomSymbols, insert } from "./_helpers.js";
import { CheckListItem } from "./check_list_item.js";

/**
 * @typedef {object} CheckListType
 * @property {string}                                             title
 * @property {import("./check_list_item.js").CheckListItemType[]} items
 */

// listens to [check-list-item:changed]
export class CheckList {

  /**
   * @param {CheckListType} props
   *
   * @returns {string} HTML string
   */
  static #template(props) {
    const title = props ? props.title ?? "Check list" : "Check list";
    const items = props ? props.items ?? [] : [];

    // An ID required if there are two or more "checklists" in one parent component
    return `<div id="${generateRandomSymbols(4)}" class="column gap-sm">
              <p class="fw-bold fs-200 clr-n-600 letter-spacing-m">${title} (${items.filter(item => item.checked).length} of ${items.length})</p>
              <ul class="column gap-sm">
                <check-list-items></check-list-items>
              </ul>
            </div>`;
  }

  /**
   * @param {CheckListType} props
   *
   * @returns {Element}
   */
  static init(props) {
    const component = this.#create(props);

    const fragment = document.createDocumentFragment();
    props.items.forEach(item => {
      fragment.appendChild(
	CheckListItem.init({ id: item.id, value: item.value, checked: item.checked })
      );
    });
    insert(fragment, "check-list-items", component);

    return component;
  }

  /**
   * @param {CheckListType} props
   *
   * @returns {Element}
   */
  static #create(props) {
    const template     = document.createElement("template");
    template.innerHTML = this.#template(props);
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error("Can't create \"CheckList\" component");

    this.#handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   *
   * @returns {void}
   */
  static #handleEvents(component) {
    component.addEventListener("check-list-item:changed", () => {
      const titleElement = component.querySelector("p");
      if (!titleElement) throw new Error("Missing <p>");
      const title = titleElement.textContent?.slice(0, titleElement.textContent.lastIndexOf("(")).trim();

      const allCheckboxes     = [...component.querySelectorAll("input")];
      const checkedCheckboxes = allCheckboxes.filter(input => input.checked);
      titleElement.textContent=`${title} (${checkedCheckboxes.length} of ${allCheckboxes.length})`;
    });
  }
}

