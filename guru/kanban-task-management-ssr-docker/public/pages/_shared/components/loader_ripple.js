// @ts-check

export class LoaderRipple {

  /** @returns {string} HTML string */
  static #template() {
    return `<div class="[ absolute ] lds-ripple"><div><div></div><div></div></div></div>`;
  }

  /** @returns {Element} */
  static init() {
    return this.#create();
  }

  /** @returns {Element} */
  static #create() {
    const template     = document.createElement("template");
    template.innerHTML = this.#template();
    const component    = template.content.firstElementChild;
    if (!component)    throw new Error("Can't create \"LoaderRipple\" component");    

    return component;
  }
}
