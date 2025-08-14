/** @typedef {string} RoleType */

/**
 * @enum {string}
 * @property {string} ANONYMOUS Represents a viewer with read-only access.
 * @property {string} AUTHZ Represents an editor with permissions to modify content.
 */
export const roles = {
  ANONYMOUS:  "anonymous",
  AUTHORIZED: "authorized"
};

export class Role {
  /** @type {RoleType} */
  static #role = roles.ANONYMOUS;

  /** @returns {RoleType} */
  static getRole() {
    return JSON.parse(JSON.stringify(this.#role));
  }

  /** @param {RoleType} value */
  static setRole(value) {
    return this.#role = value;
  }
}
