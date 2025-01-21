// @ts-check

/** @type {HTMLButtonElement|null} */
const shareBtn = document.querySelector(".share-btn");

// ************************** 1. Events *********************************//

shareBtn?.addEventListener("click", async () => {
  try {
    const userId = document.getElementById("userId");
    await navigator.clipboard.writeText(`${process.env.HOST}/${userId?.textContent}`);
    const fn = await import("/public/helpers.js");
    fn.showPopUpMessage("Link copied", "msg");
  } catch (error) {    
    const fn = await import("/public/helpers.js");
    fn.showPopUpMessage(error.message);
  }
});
