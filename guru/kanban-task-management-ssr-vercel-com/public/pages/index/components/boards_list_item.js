// @ts-check

import { Board } from "./board.js";
import { emit }  from "./helpers.js";


/**
 * @typedef {object} Props
 * @property {string} id
 * @property {string} title
 * @property {boolean} [selected] - By default "false".
 */

export class BoardsListItem {

  static prefix = "boards_list_item";

  /**
   * @param {Props} props
   * @returns {string} HTML string
   */
  static template(props) {
    return `<li id="${this.prefix}-${props.id}" class="boards-list-item { row gap-m cross-axis-center }${props.selected ? " selected" : ""}">
              <img src="images/svg/icon-board-white.svg" alt="" width="16" height="16">${props.title}
            </li>`;
  }

  /**
   * @param {Props} props
   * @returns {Element}
   */
  static init(props) {
    return BoardsListItem.#create(props);
  }

  /**
   * @param {Props} props
   * @returns {Element}
   */
  static #create(props) {
    const template     = document.createElement("template");
    template.innerHTML = BoardsListItem.template(props);
    const component    = template.content.firstElementChild;
    if (!component) throw new Error("Can't render \"BoardsListItem\" component");

    BoardsListItem.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static handleEvents(component) {
    component.addEventListener("click", async function() {
      if (this.classList.contains("selected")) return;

      const b   = `id:board_id,name`;
      const c   = `id:column_id,name`;
      const t   = `id:task_id,title,description`;
      const sub = `id:subtask_id,title,isCompleted:is_completed`;
      const select = `${b},columns(${c},tasks(${t},subtasks(${sub})))`;
      const id = component.getAttribute("id")?.slice(`${BoardsListItem.prefix}-`.length);

      const response = await fetch(
	`http://localhost:4000/boards?select=${select}&board_id=eq.${id}&columns.tasks.order=id`,
	{ headers: { "Accept": "application/vnd.pgrst.object+json" } }
      );

      if (response.status !== 200) throw new Error("Get board error");
      // @ts-ignore
      emit("board:selected", await response.json(), document.querySelector(`#${Board.prefix}`));

      this.parentElement.querySelector("li.selected")?.classList.remove("selected");
      this.classList.add("selected");
    });
  }
}
