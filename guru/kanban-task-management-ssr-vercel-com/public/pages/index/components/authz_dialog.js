// @ts-check

export class AuthzDialog {
  /** @returns {string} HTML string */
  static #template() {
    return `<dialog class="bg-n-000-800">
              <div class="column gap-l">
                <div class="row gap-m no-wrap main-axis-space-between cross-axis-start">
                  <h2 class="fs-900 clr-n-900-000">Authorization Required</h2>
                  <button class="close-btn" aria-label="close"></button>
                </div>
                <p class="fs-300 clr-n-600">You need to sign in to access this feature. Please click the button below to proceed to the authentication page.</p>
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
    if (!component)    throw new Error("Can't create \"AuthzDialog\" component");

    this.#handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   *
   * @returns {void}
   */
  static #handleEvents(component) {
    component.querySelectorAll("button")[1].addEventListener("click", () => {
      window.location.replace("/auth");
    });

    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error("Can't find <button aria-label=\"close\">");
    closeDialogBtn.addEventListener("click", () => component.remove());
  }
}
