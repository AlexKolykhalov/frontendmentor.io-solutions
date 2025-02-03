// @ts-check

/**
 * @typedef {Object} JwtPayload
 * @property {string | undefined} [sub]
 * @property {string}             [userId]
 * @property {string}             [email]
 */

/**
 * @typedef {Object} Payload
 * @property {string} userId
 * @property {string} email
 */

/**
 * @typedef {Object} Authentication
 * @property {string} email
 * @property {string} password
 * @property {string} userId
 */

/**
 * @typedef {Object} User
 * @property {string} userId
 * @property {string} avatar A Base64-encoded image string.
 * @property {string} name
 * @property {string} email
 * @property {Link[]} links
 */

/**
 * @typedef {Object} Link
 * @property {string} linkId
 * @property {string} source
 * @property {string} url
 */

export {};
