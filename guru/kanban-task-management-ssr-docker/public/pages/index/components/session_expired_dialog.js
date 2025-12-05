// @ts-check

export class SessionExpiredDialog {
  /** @returns {string} HTML string */
  static #template() {
    return `<dialog class="bg-n-000-800">
              <div class="column gap-l">
                <h2 class="fs-900 clr-n-900-000">Session Expired</h2>
                <p class="fs-300 clr-n-600">Your session has ended. Please go to the authentication page to log in again.</p>
                <div class="row gap-l main-axis-end">
                  <button class="fw-bold fs-300 clr-n-000 pad-h-m pad-v-sm border-radius-l bg-p-purple">Go to Auth Page</button>
                </div>
              </div>
            </dialog>`;
  }

 /** @returns { Element } */
  static init() {
    return this.#create();
  }

  /** @returns { Element } */
  static #create() {
    const template     = document.createElement("template");
    template.innerHTML = this.#template();
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error(`Can't create ${this.name} component`);

    this.#handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static #handleEvents(component) {
    component.querySelector("button")?.addEventListener("click", () => {
      localStorage.removeItem("bearer");
      window.location.replace("/auth");
    });

    component.addEventListener("keydown", (event) => {
      // @ts-ignore
      if (event.key === "Escape") {
	event.preventDefault();
	event.stopPropagation();
      }
    });
  }
}
