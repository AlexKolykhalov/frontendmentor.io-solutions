// @ts-check

/** @type {string} */
globalThis.role = document.body.dataset.role ? document.body.dataset.role : "guest";
delete document.body.dataset.role;

