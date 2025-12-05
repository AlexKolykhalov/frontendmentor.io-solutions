/**
 * @param {string} title
 * @param {string} message
 * @returns {Promise<void>}
 */
export async function openPopUp(title, message) {
  const { PopUp } = await import("./components/pop_up.js");
  document.body.appendChild(PopUp.init({ title: title, message: message }));
}
