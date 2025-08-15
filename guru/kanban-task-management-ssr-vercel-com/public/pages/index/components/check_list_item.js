// @ts-check

import { generateRandomSymbols, emit } from "./_helpers.js"

/**
 * @typedef {object} CheckListItemType
 * @property {string}  [id]      By default random 4 symbols.
 * @property {string}  [value]   By default "Check listitem".
 * @property {boolean} [checked] By default "false".
 */

export class CheckListItem {

  static prefix = "check_list_item"; // using in task_dialog.js
  
  /**
   * @param {CheckListItemType} [props]
   *
   * @returns {string} HTML string
   */
  static #template(props) {
    const id      = props ? props.id ?? generateRandomSymbols(4) : generateRandomSymbols(4);
    const value   = props ? props.value ?? "Check list item" : "Check list item";
    const checked = props ? props.checked ?? false : false;
    const inputID = generateRandomSymbols(4);

    return `<li id="${this.prefix}-${id}" class="fw-bold fs-200 clr-n-900-000 bg-n-100-900 bg-p-light-purple:hover">
              <label for="${inputID}" class="row no-wrap gap-sm cross-axis-center pad-sm cursor-pointer">
                <input id="${inputID}" type="checkbox" ${checked ? "checked" : ""}>${value}
              </label>
            </li>`;
  }

  /**
   * @param {CheckListItemType} [props]
   *
   * @returns {Element}
   */
  static init(props) {
    return this.#create(props);
  }

  /**
   * @param {CheckListItemType} [props]
   *
   * @returns {Element}
   */
  static #create(props) {
    const template     = document.createElement("template");
    template.innerHTML = this.#template(props);
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error("Can't create \"CheckListItem\" component");

    this.#handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   *
   * @returns {void}
   */
  static #handleEvents(component) {
    const input = component.querySelector("input");
    if (!input) throw new Error("Missing <input>");

    input.addEventListener("click", async function() {
      const taskDialog = document.querySelector("dialog");
      const idAttr     = component.getAttribute("id");
      if (!taskDialog) throw new Error("Can't find <dialog>");
      if (!idAttr)     throw new Error("Missing 'id' attribute");

      emit(
	"check-list-item:changed",
	{ id: idAttr.slice(`${CheckListItem.prefix}-`.length), isCompleted: this.checked },
	taskDialog
      );
    });
  }
}
