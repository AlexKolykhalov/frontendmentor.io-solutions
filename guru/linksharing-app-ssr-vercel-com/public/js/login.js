// @ts-check

/** @type {HTMLButtonElement|null} */
const loginBtn = document.querySelector('.login-btn');

/** @type {string} */
const url = process.env.NODE_ENV === "development" ?
      process.env.DEV_HOST ?? "unknown" :
      process.env.PROD_HOST ?? "unknown";

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
	window.location.replace("/");
      } else {
	const error = await response.json();
	loginBtn.querySelector(".clock-spinner")?.setAttribute("data-visible", "false");	
	const fn = await import("/public/helpers.js");
	fn.showPopUpMessage(error.message);	
      }
    } catch (error) {
      loginBtn.querySelector(".clock-spinner")?.setAttribute("data-visible", "false");      
      const fn = await import("/public/helpers.js");
      fn.showPopUpMessage("Internal server error");
    }
  }
});
