// @ts-check

import { showPopUpMessage } from "../../helpers.js";

/** @type {HTMLButtonElement|null} */
const shareBtn = document.querySelector(".share-btn");

// ************************** 1. Events *********************************//

shareBtn?.addEventListener("click", async () => {
  try {    
    const res  = await fetch("/share");
    await navigator.clipboard.writeText(await res.text());
    showPopUpMessage("Link copied", "msg");
  } catch (error) {    
    showPopUpMessage(error.message);
  }
});
