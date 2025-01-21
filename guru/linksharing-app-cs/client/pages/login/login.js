// @ts-check

import { showPopUpMessage } from "../../utils/utils.js";

/** @type {HTMLButtonElement|null} */
const loginBtn = document.querySelector('.login-btn');

/** @type {string} */
const url = (window.location.hostname === "localhost") ?
      "http://localhost:3000" :
      "https://sharetoyou.vercel.app";

// ************************** 1. Events *********************************//

loginBtn?.addEventListener('click', async () => {
    /** @type {HTMLInputElement|null} */
    const email = document.querySelector('#login_email');
    /** @type {HTMLInputElement|null} */
    const password = document.querySelector('#login_password');
    if (email && password) {
	try {
	    loginBtn.querySelector(".clock-spinner")?.removeAttribute("data-visible");
	    const response = await fetch(`${url}/api/login`, {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify({email: email.value, password: password.value}),
	    });
	    if (response.status === 200) {
		const token = await response.json();
		email.value = password.value = "";  // clear, just in case
		localStorage.setItem("_t1", token); // accessToken
		window.location.replace("/");
	    } else {
		const error = await response.json();
		loginBtn.querySelector(".clock-spinner")?.setAttribute("data-visible", "false");
		showPopUpMessage(error.message);
	    }
	} catch (error) {
	    loginBtn.querySelector(".clock-spinner")?.setAttribute("data-visible", "false");
	    showPopUpMessage("Internal server error");
	}
    }
});
