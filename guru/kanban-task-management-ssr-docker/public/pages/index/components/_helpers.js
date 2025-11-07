// @ts-check

/**
 * Opens the Redirect dialog.
 *
 * @returns {Promise<void>}
 */
export async function openRedirectDialog() {
  const { RedirectDialog } = await import("../components/redirect_dialog.js");
  const dialog = RedirectDialog.init();
  document.querySelector("body")?.appendChild(dialog);
  // @ts-ignore
  dialog.showModal();
}

/**
 * Opens the Authorization required dialog.
 *
 * @returns {Promise<void>}
 */
export async function openAuthzDialog() {
  const { AuthzDialog } = await import("../components/authz_dialog.js");
  const dialog = AuthzDialog.init();
  document.querySelector("body")?.appendChild(dialog);
  // @ts-ignore
  dialog.showModal();
}

/**
 * Generates a string with random symbols.
 *
 * @param {number} length - The length of a string with random symbols.
 *
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

/**
 * Emit custom event.
 *
 * @param {string} type   - The event type.
 * @param {object} detail - Any details to pass along with the event.
 * @param {Node}   elem   - The element to attach the event to.
 */
export function emit(type, detail = {}, elem) {
  if (!type) return;

  return elem.dispatchEvent(
    new CustomEvent(type, { bubbles: false, cancelable: true, detail: detail })
  );
}

/**
 * Inserts a HTML text or an Element instead of the selected element into the component.
 *
 * @param   {Element|DocumentFragment|string} variable
 * @param   {string}                          selector  Replacement element selector.
 * @param   {Element}                         component
 *
 * @throws  {Error} If we can't find an element with this `selector`.
 *
 * @returns {void}
 */
export function insert(variable, selector, component) {
  const tag = component.querySelector(selector);
  if (!tag) throw new Error(`Can't find <${selector}>`);

  if (typeof variable === "string") {
    tag.insertAdjacentHTML("afterend", variable);
  } else if (variable instanceof Element) {
    tag.insertAdjacentElement("afterend", variable);
  } else {
    tag.parentElement?.appendChild(variable);
  }

  tag.remove();
}

