// @ts-check

/**
 * Generates a string with random symbols.
 * @param {number} length - The length of a string with random symbols.
 * @returns {string}
 */
export function generateRandomSymbols(length) {
  const symbols     = "0123456789abcdefghABCDEFGH";
  let randomSymbols = "";
  for (let i = 0; i < length; i++) {
    randomSymbols += symbols[Math.floor(Math.random() * symbols.length)];
  }

  return randomSymbols;
}

/**
 * Emit custom event.
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
 * @param {Element|string} variable
 * @param {string} selector - Replacement element selector.
 * @param {Element} component
 * @throws {Error} - If we can't find an element with this `selector`.
 * @returns {void}
 */
export function insert(variable, selector, component) {
  const tag = component.querySelector(selector);
  if (!tag) throw new Error(`Can't find <${selector}>`);
  typeof variable === "string" ?
    tag.insertAdjacentHTML("afterend", variable):
    tag.insertAdjacentElement("afterend", variable);

  tag.remove();
}

