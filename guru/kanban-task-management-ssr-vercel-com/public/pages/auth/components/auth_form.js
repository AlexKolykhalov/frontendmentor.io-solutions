// @ts-check

export class AuthForm {

  static prefix   = "auth_form";
  static selector = `#${this.prefix}`;

  /** @returns {string} HTML string */
  static template() {
    const path = `data-path="http://localhost:3000/pages/auth/components/auth_form.js"`;

    return `<div id="${this.prefix}" class="column gap-l" ${path}>
	      <div class="column gap-m">
	        <div class="column gap-sm">
	          <label class="clr-n-600-000" for="login">Login</label>
	          <input class="pad-sm clr-n-900-000 bg-n-100-900" id="login" maxlength="50">
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
   *
   * @returns {void}
   */
  static handleEvents(component) {
    const contrsBtn = component.querySelectorAll("button");

    /** @type {HTMLInputElement|null} */
    const inputLogin = component.querySelector("#login");
    if (!inputLogin) throw new Error(`Missing <input id="login">`);
    inputLogin.addEventListener("input", function () { this.removeAttribute("style") } );

    /** @type {HTMLInputElement|null} */
    const inputPassword = component.querySelector("#password");
    if (!inputPassword) throw new Error(`Missing <input id="password">`);
    inputPassword.addEventListener("input", function () { this.removeAttribute("style") } );

    // sign in (anonymously)
    contrsBtn[0].addEventListener("click", async function() {
      this.setAttribute("disabled", "");
      // add indicator
      const { LoaderRipple } = await import("../../_shared/components/loader_ripple.js");
      const loader = LoaderRipple.init();
      loader.classList.add("clr-n-000");
      loader.setAttribute("style", "--size: 25px; right: 5%;");
      this.appendChild(loader);

      // [Errors 400, 401, 500] [Success 200]
      const response = await fetch(`http://localhost:3000/api/signin`, { method: "POST" });
      if (response.status !== 200) {
	this.removeAttribute("disabled");
	loader.remove();

	const { PopUp } = await import("../../_shared/components/pop_up.js");
	document.body.appendChild(
	  PopUp.init({
	    title: response.status === 401 ? "Unauthorized" : "Server error",
	    message: response.status === 401 ?
	      "Invalid credentials." :
	      "Something went wrong. Try again."
	  })
	);

	return;
      }
      localStorage.setItem("bearer", await response.json());
      window.location.replace("/"); // redirect to index.html
    });

    // sign in (login & password)
    contrsBtn[1].addEventListener("click", async function() {

      if (!validation()) return;

      this.setAttribute("disabled", "");
      // add indicator
      const { LoaderRipple } = await import("../../_shared/components/loader_ripple.js");
      const loader = LoaderRipple.init();
      loader.classList.add("clr-n-000");
      loader.setAttribute("style", "--size: 25px; right: 5%;");
      this.appendChild(loader);

      // [Errors 400, 401, 500] [Success 200]
      const response = await fetch(
	`http://localhost:3000/api/signin`,
	{
	  method: "POST",
	  headers: { "Content-Type": "application/json" },
	  body: JSON.stringify({
	    login:    inputLogin.value.trim(),
	    password: inputPassword.value.trim(),
	  })
	}
      );

      if (response.status !== 200) {
	this.removeAttribute("disabled");
	loader.remove();

	const { PopUp } = await import("../../_shared/components/pop_up.js");
	document.body.appendChild(
	  PopUp.init({
	    title: response.status === 401 ? "Unauthorized" : "Server error",
	    message: response.status === 401 ?
	      "Invalid credentials." :
	      "Something went wrong. Try again."
	  })
	);

	return;
      }

      localStorage.setItem("bearer", await response.json());
      window.location.replace("/"); // redirect to index.html
    });

    // sign up
    contrsBtn[2].addEventListener("click", async function() {
      
      if (!validation()) return;

      this.setAttribute("disabled", "");
      // add indicator
      const { LoaderRipple } = await import("../../_shared/components/loader_ripple.js");
      const loader = LoaderRipple.init();
      loader.classList.add("clr-n-000");
      loader.setAttribute("style", "--size: 25px; right: 5%;");
      this.appendChild(loader);

      // [Errors 400, 401, 500] [Success 201]
      const response = await fetch(
	`http://localhost:3000/api/signup`,
	{
	  method: "POST",
	  headers: { "Content-Type": "application/json" },
	  body: JSON.stringify({
	    login:    inputLogin.value.trim(),
	    password: inputPassword.value.trim(),
	  })
	}
      );

      if (response.status !== 201) {
	this.removeAttribute("disabled");
	loader.remove();

	const { PopUp } = await import("../../_shared/components/pop_up.js");
	document.body.appendChild(
	  PopUp.init({
	    title: response.status === 409 ? "Conflict" : "Server error",
	    message: response.status === 409 ?
	      "Login already exists." :
	      "Something went wrong. Try again."
	  })
	);

	return;
      }

      localStorage.setItem("bearer", await response.json());      
      window.location.replace("/"); // redirect to index.html
    });

    // helper functions

    /** @returns {boolean} */
    function validation() {
      /** @type {HTMLInputElement|null} */
      const inputLogin    = component.querySelector("#login");
      /** @type {HTMLInputElement|null} */
      const inputPassword = component.querySelector("#password");
      if (!inputLogin)    throw new Error(`Missing <input id="login">`);
      if (!inputPassword) throw new Error(`Missing <input id="password">`);

      let isValid = true;

      if (!inputLogin.value.trim()) {
	inputLogin.setAttribute("style", "border-color: red;");
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
