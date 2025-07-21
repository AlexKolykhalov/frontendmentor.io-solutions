// @ts-check

import { generateRandomSymbols, emit } from "./helpers.js"

/**
 * @typedef {object} CheckListItemType
 * @property {string} [id]
 * @property {string} [title]
 * @property {boolean} [checked] By default "false"
 */

export class CheckListItem {

  static prefix = "check_list_item";

  /**
   * @param {CheckListItemType} [props]
   * @returns {string} HTML string
   */
  static template(props = {}) {
    const {
      id      = generateRandomSymbols(4),
      title   = "Checkbox title",
      checked = false } = props;
    
    const inputID = generateRandomSymbols(4);

    return `<li id="${this.prefix}-${id}" class="fw-bold fs-200 clr-n-900-000 bg-n-100-900 bg-p-light-purple:hover">
              <label for="${inputID}" class="row no-wrap gap-sm cross-axis-center pad-sm cursor-pointer">
                <input id="${inputID}" type="checkbox" ${checked ? "checked" : ""}>${title}
              </label>
            </li>`;
  }

  /**
   * @param {CheckListItemType} [props]
   * @returns {Element}
   */
  static init(props = {}) {
    return CheckListItem.#create(props);
  }

  /**
   * @param {CheckListItemType} props
   *
   * @returns {Element}
   */
  static #create(props) {
    const template     = document.createElement("template");
    template.innerHTML = CheckListItem.template(props);
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error("Can't create \"CheckListItem\" component");

    console.log(component);

    CheckListItem.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   *
   * @returns {void}
   */
  static handleEvents(component) {
    const input = component.querySelector("input");
    if (!input) throw new Error("Missing <input>");

    input.addEventListener("click", async function() {
      const dialog = document.querySelector("dialog");
      const idAttr = component.getAttribute("id");
      if (!dialog) throw new Error("Can't find <dialog>");      
      if (!idAttr) throw new Error("Missing 'id' attribute");      
      
      emit(
	"check-list-item:change",
	{
	  id:          idAttr.slice(`${CheckListItem.prefix}-`.length),
	  isCompleted: this.checked
	},
	dialog // TaskDialog
      );
    });
  }
}
