// @ts-check

/** @returns {Promise<void>} */
export async function openSessionExpiredDialog() {
  const { SessionExpiredDialog } = await import("./components/session_expired_dialog.js");
  const dialog = SessionExpiredDialog.init();
  document.body.appendChild(dialog);
  // @ts-ignore
  dialog.showModal();
}

/**
 * Opens the Authorization required dialog.
 *
 * @returns {Promise<void>}
 */
export async function openAuthzDialog() {
  const { AuthzDialog } = await import("./components/authz_dialog.js");
  const dialog = AuthzDialog.init();
  document.body.appendChild(dialog);
  // @ts-ignore
  dialog.showModal();
}

/**
 * Generates a string with random symbols.
 *
 * @param {number} length - The length of a string with random symbols.
 * @returns {string}
 */
export function generateRandomSymbols(length) {
  const symbols     = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomSymbols = "";
  for (let i = 0; i < length; i++) {
    randomSymbols += symbols[Math.floor(Math.random() * symbols.length)];
  }

  return randomSymbols;
}
