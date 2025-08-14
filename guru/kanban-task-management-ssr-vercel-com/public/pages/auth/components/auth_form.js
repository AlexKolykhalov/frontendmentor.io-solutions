// @ts-check

import { LoaderRipple } from "../../_shared/components/loader-ripple.js";
import { PopUp }        from "../../_shared/components/pop-up.js";

export class AuthForm {

  static prefix     = "auth_form";
  static custom_tag = "auth-form";
  static selector   = `#${this.prefix}`;
  static #path      = "http://localhost:3000/pages/auth/components/auth_form.js";

  /** @returns {string} HTML string */
  static template() {
    return `<div id="${this.prefix}" class="column gap-l" data-path="${this.#path}">
	      <div class="column gap-m">
	        <div class="column gap-sm">
	          <label class="clr-n-600-000" for="login">Login</label>
	          <input class="pad-sm clr-n-900-000 bg-n-100-900" id="login" maxlength="50">
	        </div>
	        <div class="column gap-sm">
	          <label class="clr-n-600-000" for="password">Password</label>
	          <input class="pad-sm clr-n-900-000 bg-n-100-900" id="password" type="password" minlength="6">
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

    // sign in (anonymously)
    contrsBtn[0].addEventListener("click", async function() {
      this.setAttribute("disabled", "");
      const loader = LoaderRipple.init();
      loader.classList.add("clr-n-000");
      loader.setAttribute("style", "--size: 25px; right: 5%;");
      this.appendChild(loader);

      // [Errors 400, 401, 500] [Success 201]
      const response = await fetch(`http://localhost:3000/api/signin`, { method: "POST" });
      if (response.status === 401) throw new Error("Invalid credentials");
      if (response.status !== 201) {
	this.removeAttribute("disabled");
	loader.remove();	
	document.body.appendChild(
	  PopUp.init({ title: "Server error", message: "Something went wrong. Try again." })
	);
	
	return;
      }
      localStorage.setItem("bearer", await response.json());
      localStorage.setItem("role", "anonymous");
      window.location.replace("/"); // redirect to index.html
    });

    // sign in (login & password)
    contrsBtn[1].addEventListener("click", function() {
      console.log("click Sign in (login & password)");
      this.setAttribute("disabled", "");
      const loader = LoaderRipple.init();
      loader.classList.add("clr-n-000");
      loader.setAttribute("style", "--size: 25px; right: 27%;");
      this.appendChild(loader);
    });

    // sign up
    contrsBtn[2].addEventListener("click", function() {
      console.log("click Sign up");
      this.setAttribute("disabled", "");
      const loader = LoaderRipple.init();
      loader.classList.add("clr-n-000");
      loader.setAttribute("style", "--size: 25px; right: 27%;");
      this.appendChild(loader);
    });
  }
}
