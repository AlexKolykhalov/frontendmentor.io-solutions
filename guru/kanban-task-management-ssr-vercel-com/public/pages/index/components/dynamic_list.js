// @ts-check

import { DynamicListItem }                     from "./dynamic_list_item.js";
import { EditBoardDialog }                     from "./edit_board_dialog.js";
import { EditTaskDialog }                      from "./edit_task_dialog.js";
import { emit, generateRandomSymbols, insert } from "./_helpers.js";

/** @typedef {import("./dynamic_list_item.js").DynamicListItemType} DynamicListItemType */

/**
 * @typedef {object} DynamicListType
 * @property {string}                [title] By default "Dynamic list".
 * @property {DynamicListItemType[]} [items] By default [].
 * @property {string}                [btnText] By default "Add new item".
 * @property {number}                [limit]   By default 10.
 */
// listens to [dynamic-list-item:removed]
export class DynamicList {

  static prefix = "dynamic_list"; // using in edit_board_dialog.js (revert btn)

  /** @type {{title:string, items:DynamicListItemType[], btnText:string, limit:number}} */
  static #state = { title: "Dynamic list", items: [], btnText: "Add new item", limit: 10 };

  /** @returns {{title:string, items:DynamicListItemType[], btnText:string, limit:number}} */
  static #getState() {
    return JSON.parse(JSON.stringify(this.#state));
  }

  /** @param {{title:string, items:DynamicListItemType[], btnText:string, limit:number}} value */
  static #setState(value) {
    return this.#state = value;
  }

  /**
   * @param {DynamicListType} [props]
   *
   * @returns {string} HTML string
   */
  static #template(props) {
    const state   = this.#getState();
    const title   = props ? props.title   ?? state.title   : state.title;
    const items   = props ? props.items   ?? state.items   : state.items;
    const btnText = props ? props.btnText ?? state.btnText : state.btnText;
    const limit   = props ? props.limit   ?? state.limit   : state.limit;

    this.#setState({title: title, items: items, btnText: btnText, limit: limit});

    // An ID required if there are two or more "checklists" in one parent component
    const text = `<div id="${this.prefix}-${generateRandomSymbols(4)}" class="column gap-sm">
                    <p class="fs-300 fw-bold clr-n-600-000">${title}</p>
                    <ul class="column gap-sm">
                      <dynamic-list-items></dynamic-list-items>
                    </ul>
                    <button class="fw-bold fs-300 pad-h-m pad-v-sm clr-n-000-p-purple border-radius-l bg-p-purple-n-000">${btnText} <span>(${limit - items.length})</span></button>
                  </div>`;

    return text;
  }

  /**
   * @param {DynamicListType} [props]
   *
   * @returns {Element}
   */
  static init(props) {
    const component = this.#create(props);

    const fragment = document.createDocumentFragment();
    if (props) {
      props.items?.forEach(
	item => {
	  fragment.appendChild(
	    DynamicListItem.init({
	      id:                item.id,
	      value:             item.value,
	      placeholder:       item.placeholder,
	      deleteBtnDisabled: item.deleteBtnDisabled
	    })
	  );
	}
      );
    }
    insert(fragment, "dynamic-list-items", component);

    return component;
  }

  /**
   * @param {DynamicListType} [props]
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

    const addNewColumnBtn = component.querySelector(":scope > button");
    if (!addNewColumnBtn) throw new Error("Can't find <button>");
    addNewColumnBtn.addEventListener("click", function() {
      ul.querySelector("button[disabled]")?.removeAttribute("disabled");

      const state = DynamicList.#getState();
      // adding DynamicListItem
      ul.appendChild(DynamicListItem.init({ placeholder: state.items[0].placeholder }));

      this.querySelector("span").textContent = (state.limit - [...ul.children].length) > 0 ?
	`(${state.limit - [...ul.children].length})` :
	"";
      if (state.limit - [...ul.children].length === 0) this.setAttribute("disabled", "");

      // Notifies EditBoardDialog or EditTaskDialog that a new DynamicListItem has been added
      const editBoardDialog = document.querySelector(`#${EditBoardDialog.prefix}`);
      const editTaskDialog  = document.querySelector(`#${EditTaskDialog.prefix}`);
      if (editBoardDialog) emit("dynamic-list-item:added", {}, editBoardDialog);
      if (editTaskDialog)  emit("dynamic-list-item:added", {}, editTaskDialog);
    });

    component.addEventListener("dynamic-list-item:removed", () => {
      const span = addNewColumnBtn.querySelector("span");
      if (!span) throw new Error("Missing <span>");

      const state = DynamicList.#getState();
      span.textContent = `(${state.limit - [...ul.children].length})`;
      if ([...ul.children].length === state.limit - 1) addNewColumnBtn.removeAttribute("disabled");
      if (state.items.length > 0 && [...ul.children].length === 1)
	ul.querySelectorAll("button").forEach(item => item.setAttribute("disabled", ""));
    });
  }
}
