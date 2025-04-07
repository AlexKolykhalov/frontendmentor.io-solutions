// @ts-check

import { Board } from "./board.js";
import { Column } from "./column.js";
import { getTaskData } from "./helpers.js";

export class Task {

  static prefix = "task";

  /**
   * @param {import("./types.js").Task} task
   * @returns {string} HTML string
   */
  static template(task) {
    return `<li id="${this.prefix}-${task.id}" class="task-item">
              <p>${task.title}</p>
              <p>${task.subtasks.filter(item => item.isCompleted).length} of ${task.subtasks.length} Subtasks</p>
            </li>`;
  }

  /**
   * @param {import("./types.js").Task} task
   * @returns {Element}
   */
  static init(task) {
    return Task.#create(task);
  }

  /**
   * @param {import("./types.js").Task} task
   * @returns {Element}
   */
  static #create(task) {
    const template     = document.createElement("template");
    template.innerHTML = Task.template(task);
    const component    = template.content.firstElementChild;
    if (!component) throw new Error("Can't create \"Task\" component");

    Task.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static handleEvents(component) {
    component.addEventListener("click", async () => {
      const boardID  = document.querySelector(`[id^=${Board.prefix}-]`)?.getAttribute("id")?.slice(`${Board.prefix}-`.length);
      const columnID = component.closest(`[id^=${Column.prefix}-]`)?.getAttribute("id")?.slice(`${Column.prefix}-`.length);
      const taskID   = component.getAttribute("id")?.slice(`${Task.prefix}-`.length);

      if (!boardID)  throw new Error("Can't find boardID");
      if (!columnID) throw new Error("Can't find columnID");
      if (!taskID)   throw new Error("Can't find taskID");

      const { TaskDialog } = await import("../components/task_dialog.js");
      const dialog = TaskDialog.init(getTaskData(boardID, columnID, taskID));
      document.querySelector("body")?.appendChild(dialog);
      dialog.showModal();
    });

    // component.querySelectorAll("ul > li").forEach(item => {
    //   item.addEventListener("click", () => {
    // 	if (!item.classList.contains("selected")) {
    // 	  component.querySelector("ul > li.selected")?.classList.remove("selected");
    //       item.classList.add("selected");
    // 	}
    //   });
    // });

    // component.querySelector(":scope > button")?.addEventListener("click", async () => {
    //   const { CreateNewBoardDialog } = await import("../components/create_new_board_dialog.js");
    //   const dialog = CreateNewBoardDialog.render();
    //   document.querySelector("body")?.appendChild(dialog);
    //   dialog.showModal();
    // });

    // document.addEventListener("board:create", (event) => {
    //   const header = component.querySelector("header");
    //   const ul     = component.querySelector("ul");
    //   if (!header) throw new Error("Can't find <header>");
    //   if (!ul)     throw new Error("Can't find <ul>");

    //   header.textContent = `ALL BOARDS (${[...ul.children].length + 1})`;
    //   component.querySelector("ul > li.selected")?.classList.remove("selected");
    //   component.querySelector("ul")?.appendChild(BoardsListItem.render(event.detail.name, true));
    // });
  }
}
