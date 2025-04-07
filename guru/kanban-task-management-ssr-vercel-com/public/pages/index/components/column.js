// @ts-check

import { Task } from "./task.js";

export class Column {

  static prefix = "column";

  /**
   * @param {import("./types.js").Column} column
   * @returns {string} HTML string
   */
  static template(column) {
    return `<li id="${this.prefix}-${column.id}">
              <article class="bg-n-600 pad-h-m">
                <h3 class="pad-v-m">${column.name} (${column.tasks.length})</h3>
                <ul class="column gap-m">
                  ${column.tasks.map(task => Task.template(task)).join("")}
                </ul>
              </article>
            </li>`;
  }

  /**
   * @param {import("./types.js").Column} column
   * @returns {Element}
   */
  static init(column) {
    return Column.#create(column);
  }

  /**
   * @param {import("./types.js").Column} column
   * @returns {Element}
   */
  static #create(column) {
    const template     = document.createElement("template");
    template.innerHTML = Column.template(column);
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error("Can't create \"Column\" component");

    Column.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static handleEvents(component) {
    component.addEventListener("task:create", (event) => {
      console.log("task:create");
      component.querySelector("ul")?.appendChild(Task.init(event.detail));
    });
  }
}
