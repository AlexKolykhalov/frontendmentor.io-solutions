// @ts-check

import db from "../database/models/index.js";

/**
 * @typedef { import("../types/typedefs.js").Link } Link
 */

/**
 * @class
 */
export class LinkService {
  /**
   * @async
   * @param {string} linkId
   * @returns {Promise<Link|null>}
   */
  static async findLink(linkId) {
    return await db.Link.findOne({
      attributes: ["link_id", "url"],
      where: { linkId: linkId }
    });
  }

  /**
   * @async
   * @param {Link} link
   * @returns {Promise<Link>}
   */
  static async updateLink(link) {
    return await db.Link.update(
      { link_id: link.id, url: link.url },
      { where: { linkId: link.id } }
    );
  }

  /**
   * @async
   * @param {Link} link
   * @param {string} userId
   * @returns {Promise<Link>}
   */
  static async createLink(link, userId) {
    return await db.Link.create(
      {
	url: link.url,
	linkId: link.id,
	userId: userId
      }
    );
  }

  /**
   * @async
   * @param {Link} link
   * @returns {Promise<void>}
   */
  static async deleteLink(link) {
    return await db.Link.destroy({
      where: { linkId: link.id }
    });
  }
}
