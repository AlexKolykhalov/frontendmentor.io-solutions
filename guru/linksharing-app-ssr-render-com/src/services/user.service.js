// @ts-check

import db from "../database/models/index.js";
import { LinkService } from "./link.service.js";
import { TokenService } from "./token.service.js";

/**
 * @typedef { import("../types/typedefs.js").User } User
 */

/**
 * @class
 */
export class UserService {

  /**
   * @async
   * @param {string} userId
   * @returns {Promise<User|null>}
   */
  static async findByUserId(userId) {
    return await db.User.findOne({
      attributes: ["userId", "avatar", "name", "email"],
      include: [
	{
	  model: db.Link,
	  as: "links",
	  attributes: [["link_id", "id"], "url"],
	  required: false,
	},
      ],
      where: { userId: userId },
      order: [ [{model: db.Link, as: "links"}, "id", "ASC"] ]
    });
  }

  /**
   * @async
   * @param {string} token
   * @returns {Promise<User|null>}
   * @throws {ServerError} Throws ServerError.unauthorized
   */
  static async findByUserToken(token) {
    /** @type {string} */
    // @ts-ignore
    const userId = TokenService.verifyRefreshToken(token)?.userId;
    return await this.findByUserId(userId);
  }

  /**
   * @async
   * @param {User} userData
   * @returns {Promise<User|null>}
   * @throws {ServerError} Throws ServerError.unauthorized or Error
   */
  static async updateUser(userData) {
    await db.sequelize.transaction(async () => {
      const count = await db.User.update(
	userData,
	{ where: { userId: userData.userId } }
      );
      if (count === 0) throw new Error("Can't update a User");
      for (const item of userData.links) {
	const link = await LinkService.findLink(item.id);
	if (!link)             await LinkService.createLink(item, userData.userId);
	if (link && item.url)  await LinkService.updateLink(item);
	if (link && !item.url) await LinkService.deleteLink(item);
      }
    });
    return await this.findByUserId(userData.userId);
  }

  /**
   * @async
   * @returns {Promise<User>}
   */
  static async createUser() {
    return await db.User.create();;
  }

  /**
   * @async
   * @returns {Promise<void>}
   */
  static async deleteUser() {
    return await db.User.destroy();
  }
}
