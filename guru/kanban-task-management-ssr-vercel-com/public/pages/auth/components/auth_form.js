// @ts-check

export class AuthForm {
  static prefix = "auth-form";

  /** @returns {string} HTML string */
  static template() {
    globalThis.paths[this.prefix] = "/pages/auth/components/auth_form.js";

    return `<div class="column gap-l" data-prefix="${this.prefix}">
	      <div class="column gap-m">
	        <div class="column gap-sm">
	          <label class="clr-n-600-000" for="email">Email</label>
	          <input class="pad-sm clr-n-900-000 bg-n-100-900" id="email" type="email">
	        </div>
	        <div class="column gap-sm">
	          <label class="clr-n-600-000" for="password">Password (more than 5 symbols)</label>
	          <input class="pad-sm clr-n-900-000 bg-n-100-900" id="password" type="password">
	        </div>
	      </div>
	      <div class="column gap-m">
	        <button class="[ relative ] clr-n-000 bg-p-purple fs-500 pad-v-sm pad-h-m border-radius-l"><span>Sign In (anonymously)</span></button>
	        <button class="[ relative ] clr-n-000 bg-p-purple fs-500 pad-v-sm pad-h-m border-radius-l">Sign In</button>
	        <button class="[ relative ] clr-n-000 bg-p-purple fs-500 pad-v-sm pad-h-m border-radius-l">Sign Up</button>
	      </div>
	    </div>`;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static handleEvents(component) {
    const contrsBtn = component.querySelectorAll("button");

    /** @type {HTMLInputElement|null} */
    const inputEmail = component.querySelector("#email");
    if (!inputEmail) throw new Error(`<input id="email"> is missing`);
    inputEmail.addEventListener("input", function () { this.removeAttribute("style") } );

    /** @type {HTMLInputElement|null} */
    const inputPassword = component.querySelector("#password");
    if (!inputPassword) throw new Error(`<input id="password"> is missing`);
    inputPassword.addEventListener("input", function () { this.removeAttribute("style") } );

    // sign in (anonymously)
    contrsBtn[0].addEventListener("click", async function() {
      // add indicator
      const { LoaderRipple } = await import("../../_shared/components/loader_ripple.js");
      const loader = LoaderRipple.init();
      loader.classList.add("clr-n-000");
      loader.setAttribute("style", "--size: 25px; right: 5%;");
      this.appendChild(loader);

      // disable SignIn btn
      this.setAttribute("disabled", "");

      // [Errors 400, 500] [Success 200]
      const response = await fetch(`/v1/signin`, { method: "POST" });

      if (response.status !== 200) {
	this.removeAttribute("disabled");
	loader.remove();
	const { openPopUp } = await import("../../_shared/functions.js");
	await openPopUp("Server error", "Something went wrong. Try again.");

	return;
      }

      window.location.replace("/"); // redirect to index.html
    });

    // sign in (login & password)
    contrsBtn[1].addEventListener("click", async function() {
      if (!validation()) return;

      // add indicator
      const { LoaderRipple } = await import("../../_shared/components/loader_ripple.js");
      const loader = LoaderRipple.init();
      loader.classList.add("clr-n-000");
      loader.setAttribute("style", "--size: 25px; right: 5%;");
      this.appendChild(loader);

      // disable SignIn btn
      this.setAttribute("disabled", "");

      const url     = "/v1/signin";
      const options = {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
	  email:    inputEmail.value.trim(),
	  password: inputPassword.value.trim(),
	})
      };
      
      // [Errors 400, 500] [Success 200]
      const response = await fetch(url, options);

      if (response.status !== 200) {
	this.removeAttribute("disabled");
	loader.remove();
	const { openPopUp } = await import("../../_shared/functions.js");
	await openPopUp(
	  response.status === 500 ? "Server error" : "Signin error",
	  await response.json()
	);

	return;
      }

      window.location.replace("/"); // redirect to index.html
    });

    // sign up
    contrsBtn[2].addEventListener("click", async function() {

      if (!validation()) return;

      // add indicator
      const { LoaderRipple } = await import("../../_shared/components/loader_ripple.js");
      const loader = LoaderRipple.init();
      loader.classList.add("clr-n-000");
      loader.setAttribute("style", "--size: 25px; right: 5%;");
      this.appendChild(loader);

      // disable SignIn btn
      this.setAttribute("disabled", "");

      const url     = "/v1/signup";
      const options = {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
	  email:    inputEmail.value.trim(),
	  password: inputPassword.value.trim(),
	})
      };
      
      // [Errors 400, 401, 422, 500] [Success 201]
      const response = await fetch(url, options);

      if (response.status !== 201) {
	this.removeAttribute("disabled");
	loader.remove();
	const { openPopUp } = await import("../../_shared/functions.js");
	await openPopUp(
	  response.status === 500 ? "Server error" : "Signup error",
	  response.status === 500 ? "Something went wrong. Try again." : await response.json()
	);

	return;
      }

      window.location.replace("/"); // redirect to index.html
    });

    // *** ADDITIONAL FUNCTIONS ***

    /** @returns {boolean} */
    function validation() {
      /** @type {HTMLInputElement|null} */
      const inputEmail    = component.querySelector("#email");
      /** @type {HTMLInputElement|null} */
      const inputPassword = component.querySelector("#password");
      if (!inputEmail)    throw new Error(`<input id="email"> is missing`);
      if (!inputPassword) throw new Error(`<input id="password"> is missing`);

      let isValid = true;

      if (!inputEmail.value.trim()) {
	inputEmail.setAttribute("style", "border-color: red;");
	isValid = false;
      }

      if (!inputPassword.value.trim() || inputPassword.value.trim().length < 6 ) {
	inputPassword.setAttribute("style", "border-color: red;");
	isValid = false;
      }

      return isValid;
    }
  }
}
