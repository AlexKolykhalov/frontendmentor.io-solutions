// @ts-check

import { showPopUpMessage } from "../helpers.js";

/** @type {HTMLButtonElement|null} */
const shareBtn = document.querySelector(".share-btn");

/** @type {string} */
const url = (window.location.hostname === "localhost") ?
      "http://localhost:3000" :
      "https://linksharing-app-ssr-render-com.onrender.com";

// ************************** 1. Events *********************************//

shareBtn?.addEventListener("click", async () => {
  try {
    const userId = document.getElementById("userId");
    await navigator.clipboard.writeText(`${url}/${userId?.textContent}`);    
    showPopUpMessage("Link copied", "msg");
  } catch (error) {    
    showPopUpMessage(error.message);
  }
});
