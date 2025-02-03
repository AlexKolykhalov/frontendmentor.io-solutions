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
	    attributes: ["link_id", "source", "url"],
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
	    link,
	    { where: { linkId: link.linkId } }
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
		source: link.source,
		url: link.url,
		linkId: link.linkId,		
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
	    where: { linkId: link.linkId }
	});
    }
}
