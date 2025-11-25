// @ts-check

export class DeleteUserDialog {
  /** @returns {string} HTML string */
  static #template() {
    return `<dialog class="bg-n-000-800">
              <div class="column gap-l">
                <div class="row gap-m main-axis-space-between">
                  <h2 class="fs-900 clr-n-900-000">Delete user?</h2>
                  <button class="close-btn" aria-label="close"></button>
                </div>
                <p class="fs-300 clr-n-600">Are you sure you want to delete the <strong class="clr-n-900-000">current user</strong> and their data? This action cannot be reversed.</p>
                <div class="row gap-l main-axis-end">
                  <button class="[ relative ] fw-bold fs-300 pad-h-l clr-n-000 pad-v-sm border-radius-l bg-p-red">Delete</button>
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
    // delete btn
    component.querySelectorAll("button")[1].addEventListener("click", async function() {
      this.setAttribute("disabled", ""); // disable deleteUserBtn
      // add indicator
      const { LoaderRipple } = await import("../../_shared/components/loader_ripple.js");
      const loader = LoaderRipple.init();
      loader.classList.add("clr-n-000");
      loader.setAttribute("style", "--size: 25px; right: 5%;");
      this.appendChild(loader);

      const url     = "/v1/users/delete_current";
      const options = { method: "POST" };
      // [Errors 400, 401, 403, 500] [Success 200]
      const response = await fetch(url, options);

      if (response.status !== 200) {
	if (response.status === 401) {
	  const { openAuthzDialog } = await import("../functions.js");
	  await openAuthzDialog();
	}

	if (response.status === 403 || response.status !== 200) {
	  const { openSessionExpiredDialog } = await import("../functions.js");
	  await openSessionExpiredDialog();
	}
	
	this.removeAttribute("disabled"); // enable deleteUserBtn
	loader.remove();

	return;
      }
      
      window.location.replace("/auth");
    });

    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error(`Can't <button aria-label="close"> is missing`);
    closeDialogBtn.addEventListener("click", () => component.remove());
  }
}
