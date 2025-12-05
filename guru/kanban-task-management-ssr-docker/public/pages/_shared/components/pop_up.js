// @ts-check

/**
 * @typedef {object} Props
 * @property {string} title
 * @property {string} message
 */

export class PopUp {

  static #prefix = "popup";

  /**
   * @param {Props} props
   * @returns {string} HTML string
   */
  static #template(props) {
    return `<div id="${this.#prefix}" class="[ absolute ] pop-up">
              <div class="row no-wrap gap-sm cross-axis-center">
                <img src="images/svg/icon-warning.svg" alt="" width="36" height="36">
                <div class="column">
                  <p class="fw-bold clr-n-900-000">${props.title}</p>
                  <p class="clr-n-900-000">${props.message}</p>
                </div>
              </div>
              <button class="close-btn" aria-label="close"></button>
            </div>`;
  }

  /**
   * @param {Props} props
   * @returns {Element}
   */
  static init(props) {
    document.querySelector(`#${this.#prefix}`)?.remove();

    return this.#create(props);
  }

  /**
   * @param {Props} props
   * @returns {Element}
   */
  static #create(props) {
    const template     = document.createElement("template");
    template.innerHTML = this.#template(props);
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
    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error(`<button aria-label="close"> is missing`);
    closeDialogBtn.addEventListener("click", () => component.remove());

    // implement animation
    setTimeout(() => {
      const keyframes = [{ opacity: 0, bottom: "70px", offset: 0 }, { opacity: 1, bottom: "80px", offset: 1 }];
      const options   = { duration: 150, easing: "ease-in" };
      component
	.animate(keyframes, options)
        // @ts-ignore
	.onfinish = () => { component.style.opacity = 1; }
    }, 10);
  }
}
