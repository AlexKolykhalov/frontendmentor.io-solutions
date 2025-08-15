// @ts-check

import { ColorSchemeToggle } from "../../_shared/components/color-scheme-toggle.js";

export class ControlBtns {

  static selector = `#control_btns`;

  /** @returns {string} HTML string */
  static template() {
    const path  = `data-path="http://localhost:3000/pages/index/components/control_btns.js"`;
    
    return `<div id="control_btns" class="column gap-m pad-m" style="margin-bottom: 20px;" ${path}>
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
    if (!hideSidebarBtn) throw new Error("Missing :scope > button");
    hideSidebarBtn.addEventListener("click", () => {
      const sidebar = document.querySelector("main > .with-left-sidebar > :nth-child(1)");
      const hideSidebarBtnInBoardComponent = document.querySelector("#board > button");
      if (!sidebar) throw new Error("Missing main > .with-left-sidebar > :nth-child(1)");
      if (!hideSidebarBtnInBoardComponent) throw new Error("Missing #board > button");

      sidebar.classList.add("md:display-none");
      hideSidebarBtnInBoardComponent.classList.remove("md:display-none");
    });
  }
}
