// @ts-check

import { showPopUpMessage } from "../../utils/utils.js";

/** @type {HTMLButtonElement|null} */
const signupBtn = document.querySelector('.signup-btn');

// ************************** 1. Events *********************************//

signupBtn?.addEventListener('click', async () => {
    /** @type {HTMLInputElement|null} */
    const email = document.querySelector('#signup_email');
    /** @type {HTMLInputElement|null} */
    const password = document.querySelector('#signup_password');
    if (email && password) {
	try {
	    signupBtn.querySelector(".clock-spinner")?.removeAttribute("data-visible");
	    const response = await fetch("http://localhost:3000/api/signup", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify({email: email.value, password: password.value}),
	    });
	    if (response.status === 201) {
		const token = await response.json();
		email.value = password.value = "";  // clear, just in case
		localStorage.setItem("_t1", token); // accessToken		
		location.replace("/");
	    } else {
		const error = await response.json();
		signupBtn.querySelector(".clock-spinner")?.setAttribute("data-visible", "false");
		showPopUpMessage(error.message);	    	
	    }	    	    
	} catch (error) {
	    signupBtn.querySelector(".clock-spinner")?.setAttribute("data-visible", "false");
	    showPopUpMessage("Internal server error");
	}
    }
});

// ************************* 2. Functions *******************************//
