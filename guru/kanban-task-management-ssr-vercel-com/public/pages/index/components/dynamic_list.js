// @ts-check

import { DynamicListItem }                     from "./dynamic_list_item.js";
import { EditBoardDialog }                     from "./edit_board_dialog.js";
import { EditTaskDialog }                      from "./edit_task_dialog.js";
import { emit, generateRandomSymbols, insert } from "./_helpers.js";

/** @typedef {import("./dynamic_list_item.js").DynamicListItemType} DynamicListItemType */

/**
 * @typedef {object} DynamicListType
 * @property {string}                title
 * @property {DynamicListItemType[]} items
 * @property {string}                [btnText] By default "Add new item".
 * @property {number}                [min]     By default 0.
 * @property {number}                [max]     By default 10.
 */
// listens to [dynamic-list-item:removed]
export class DynamicList {

  static prefix = "dynamic_list"; // using in edit_board_dialog.js (revert btn)

  /** @type {{title:string, items:DynamicListItemType[], btnText:string, min:number, max:number}} */
  static #state = { title: "Dynamic list", items: [], btnText: "Add new item", min: 0, max: 10 };

  /** @returns {{title:string, items:DynamicListItemType[], btnText:string, min:number, max:number}} */
  static #getState() {
    return JSON.parse(JSON.stringify(this.#state));
  }

  /** @param {{title:string, items:DynamicListItemType[], btnText:string, min:number, max:number}} value */
  static #setState(value) {
    return this.#state = value;
  }

  /**
   * @param {DynamicListType} props
   *
   * @returns {string} HTML string
   */
  static #template(props) {
    const state   = this.#getState();

    const title   = props.title;
    const items   = props.items;    
    const btnText = props.btnText ?? state.btnText;
    const min     = props.min     ?? state.min;
    const max     = props.max     ?? state.max;    

    this.#setState({title: title, items: items, btnText: btnText, min: min, max: max});

    // An ID required if there are two or more "checklists" in one parent component
    const text = `<div id="${this.prefix}-${generateRandomSymbols(4)}" class="column gap-sm">
                    <p class="fs-300 fw-bold clr-n-600-000">${title}</p>
                    <ul class="column gap-sm">
                      <dynamic-list-items></dynamic-list-items>
                    </ul>
                    <button class="fw-bold fs-300 pad-h-m pad-v-sm clr-n-000-p-purple border-radius-l bg-p-purple-n-000">${btnText} <span>(${max - items.length})</span></button>
                  </div>`;

    return text;
  }

  /**
   * @param {DynamicListType} props
   *
   * @returns {Element}
   */
  static init(props) {
    const component = this.#create(props);

    const fragment = document.createDocumentFragment();
    props.items.forEach(item => {
      fragment.appendChild(
	DynamicListItem.init({
	  id:                item.id,
	  value:             item.value,
	  placeholder:       item.placeholder,
	  deleteBtnDisabled: item.deleteBtnDisabled
	})
      );
    });
    insert(fragment, "dynamic-list-items", component);

    return component;
  }

  /**
   * @param {DynamicListType} props
   *
   * @returns {Element}
   */
  static #create(props) {
    const template     = document.createElement("template");
    template.innerHTML = this.#template(props);
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error("Can't create \"DynamicList\" component");

    this.#handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   *
   * @returns {void}
   */
  static #handleEvents(component) {
    const ul = component.querySelector("ul");
    if (!ul) throw new Error("Can't find <ul>");

    const addBtn = component.querySelector(":scope > button");
    if (!addBtn) throw new Error("Can't find <button>");
    addBtn.addEventListener("click", function() {
      ul.querySelector("button[disabled]")?.removeAttribute("disabled");

      const state = DynamicList.#getState();
      // adding DynamicListItem
      ul.appendChild(DynamicListItem.init({ placeholder: state.items.length > 0 ? state.items[0].placeholder : "" }));

      this.querySelector("span").textContent = (state.max - [...ul.children].length) > 0 ?
	`(${state.max - [...ul.children].length})` :
	"";
      if (state.max - [...ul.children].length === 0) this.setAttribute("disabled", "");

      // Notifies EditBoardDialog or EditTaskDialog that a new DynamicListItem has been added
      const editBoardDialog = document.querySelector(`#${EditBoardDialog.prefix}`);
      const editTaskDialog  = document.querySelector(`#${EditTaskDialog.prefix}`);
      if (editBoardDialog) emit("dynamic-list-item:added", {}, editBoardDialog);
      if (editTaskDialog)  emit("dynamic-list-item:added", {}, editTaskDialog);
    });

    // *** ADDITIONAL LISTENERS ***

    component.addEventListener("dynamic-list-item:removed", () => {
      const span = addBtn.querySelector("span");
      if (!span) throw new Error("Missing <span>");

      const state = DynamicList.#getState();
      span.textContent = `(${state.max - [...ul.children].length})`;
      if ([...ul.children].length === state.max - 1) addBtn.removeAttribute("disabled");      
      if ([...ul.children].length === state.min)
	ul.querySelectorAll("button").forEach(item => item.setAttribute("disabled", ""));
    });
  }
}
