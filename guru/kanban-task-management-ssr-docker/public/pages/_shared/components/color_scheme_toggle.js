// @ts-check

export class ColorSchemeToggle {
  static prefix = "color-scheme-toggle";

  /** @returns {string} HTML string */
  static template() {
    globalThis.paths[this.prefix] = "/pages/_shared/components/color_scheme_toggle.js";

    return `<div class="row gap-m main-axis-center cross-axis-center border-radius-m pad-m bg-n-100-900" data-prefix="${this.prefix}">
              <img src="images/svg/icon-light-theme.svg" width="19" height="19" alt="">
              <label class="toggle" for="toggle_btn">
                <span class="sr-only">Toggle</span>
                <input type="checkbox" id="toggle_btn">
                <span class="toggle-background"></span>
              </label>
              <img src="images/svg/icon-dark-theme.svg" width="19" height="19" alt="">
            </div>`;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static handleEvents(component) {
    /** @type {HTMLInputElement|null} */
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
