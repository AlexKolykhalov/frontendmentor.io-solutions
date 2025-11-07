// @ts-check

import { ColorSchemeToggle } from "../../_shared/components/color_scheme_toggle.js";

export class ControlBtns {
  static prefix = "control-btns";
  
  /** @returns {string} HTML string */
  static template() {
    globalThis.paths[this.prefix] = "/pages/index/components/control_btns.js";

    return `<div class="column gap-m pad-m" style="margin-bottom: 20px;" data-prefix="${this.prefix}">
              ${ColorSchemeToggle.template()}
              <button class="[ m:display-none ] hide-sidebar-btn hide" style="position: relative; left: -1rem; width: calc(100% + 1rem); padding-left: 2rem;">
                <img src="images/svg/icon-hide-sidebar.svg" alt="">
                Hide Sidebar
              </button>
            </div>`;
  }

  /**
   * @param {Element} component
   *
   * @returns {void}
   */
  static handleEvents(component) {
    const hideSidebarBtn = component.querySelector(":scope > button");
    if (!hideSidebarBtn) throw new Error("<button> is missing");

    hideSidebarBtn.addEventListener("click", async () => {
      const { Board } = await import("./board.js");
      const sidebar = document.querySelector("main > .with-left-sidebar > :nth-child(1)");
      const hideSidebarBtnInBoardComponent = document.querySelector(`[data-prefix="${Board.prefix}"] > button`);
      if (!sidebar) throw new Error(".with-left-sidebar > :nth-child(1) is missing");
      if (!hideSidebarBtnInBoardComponent) throw new Error(`[data-prefix="${Board.prefix}"] > <button> is missing`);

      sidebar.classList.add("md:display-none");
      hideSidebarBtnInBoardComponent.classList.remove("md:display-none");
    });
  }
}
