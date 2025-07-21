// @ts-check

export class ControlBtns {

  static prefix = "control_btns";

  /** @returns {string} HTML string */
  static template() {
    return `<div id="${ControlBtns.prefix}" class="column gap-m pad-m" style="margin-bottom: 20px;">
              <div class="row gap-m main-axis-center cross-axis-center border-radius-m pad-m bg-n-100-900">
                <img src="images/svg/icon-light-theme.svg" width="19" height="19" alt="">
                <label class="toggle" for="toggle_btn">
                  <span class="sr-only">Toggle</span>
                  <input type="checkbox" id="toggle_btn">
                  <span class="toggle-background"></span>
                </label>
                <img src="images/svg/icon-dark-theme.svg" width="19" height="19" alt="">
              </div>
              <button class="[ m:display-none ] hide-sidebar-btn hide" style="position: relative; left: -1rem; width: calc(100% + 1rem); padding-left: 2rem;">
                <img src="images/svg/icon-hide-sidebar.svg" alt="">
                Hide Sidebar
              </button>
            </div>`;
  }

  /** @returns {Element} */
  static init() {
    return ControlBtns.#create();
  }

  /** @returns {Element} */
  static #create() {
    const template     = document.createElement("template");
    template.innerHTML = ControlBtns.template();
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error("Can't create \"Board\" component");

    ControlBtns.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
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

    const toggleColorThemeBtn = component.querySelector('input[type="checkbox"]');
    if (!toggleColorThemeBtn) throw new Error('input[type="checkbox"]');

    localStorage.getItem("color-scheme") === "light" ?
      toggleColorThemeBtn.checked = false :
      toggleColorThemeBtn.checked = true;

    toggleColorThemeBtn.addEventListener("click", () => {
      if (document.body.getAttribute("data-theme") === "dark") {
	document.body.setAttribute("data-theme", "light");
	localStorage.setItem("color-scheme", "light");
      } else {
	document.body.setAttribute("data-theme", "dark");
	localStorage.setItem("color-scheme", "dark");
      }
    });
  }
}
