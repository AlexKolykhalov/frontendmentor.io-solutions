// @ts-check

import jwt from "jsonwebtoken";
import db from "../database/models/index.js";
import { Op } from "sequelize";

/**
 * @typedef {import("../types/typedefs.js").JwtPayload} JwtPayload
 * @typedef {import("../types/typedefs.js").Payload} Payload
 */

/**
 * @class
 */
export class TokenService {
    /**
     * @param {Payload} payload
     * @returns {{access:string, refresh:string}}
     * @throws {Error} Throws an error if the secrets is not defined.
     */
    static generateTokens(payload) {
	const SECRET_ACCESS_TOKEN  = process.env.SECRET_ACCESS_TOKEN;
	const SECRET_REFRESH_TOKEN = process.env.SECRET_REFRESH_TOKEN;
	if (!SECRET_ACCESS_TOKEN || !SECRET_REFRESH_TOKEN) throw new Error("JWT_SECRET is not defined");
	const accessToken  = jwt.sign(payload, SECRET_ACCESS_TOKEN, {expiresIn: "10m"});
	const refreshToken = jwt.sign(payload, SECRET_REFRESH_TOKEN, {expiresIn: "30m"});
	return {
	    access: accessToken,
	    refresh: refreshToken
	};
    }

    /**
     * @param {string} token
     * @returns {string|JwtPayload|null}
     */
    static verifyAccessToken(token) {
	try {
	    return jwt.verify(token, process.env.SECRET_ACCESS_TOKEN ?? "");
	} catch (error) {
	    return null;
	}
    }

    /**
     * @param {string} token
     * @returns {string|JwtPayload|null}
     */
    static verifyRefreshToken(token) {
	try {
	    return jwt.verify(token, process.env.SECRET_REFRESH_TOKEN ?? "");
	} catch (error) {
	    return null;
	}
    }

    /**
     * @async
     * @param {string} token
     * @returns {Promise<string|null>}
     */
    static async findRefreshToken(token) {
	return await db.UserToken.findOne({
	    attributes: ["token", "userId"],
	    where: { token: token }
	});
    }

    /**
     * @async
     * @param {string} newToken
     * @param {string} oldToken
     * @returns {Promise<string>}
     */
    static async updateRefreshToken(newToken, oldToken) {
	return await db.UserToken.update(
 	    {
		token: newToken,
		createdAt: new Date() // date converts to UTC by config.js
	    },
	    {
		where: { token: oldToken }
	    }
	);
    }

    /**
     * @async
     * @param {string} token
     * @param {string} userId
     * @returns {Promise<string>}
     */
    static async createRefreshToken(token, userId) {
	return await db.UserToken.create(
	    {
		token: token,
		userId: userId,
	    }
	);
    }

    /**
     * @async
     * @param {string} token
     * @returns {Promise<void>}
     */
    static async deleteRefreshToken(token) {
	return await db.UserToken.destroy({
	    where : { token: token }
	});
    }

    /**
     * All refresh tokens created earlier than one hour from the current
     * date will be deleted
     * @async
     * @returns {Promise<void>}
     */
    static async deleteRefreshTokens() {
	return await db.UserToken.destroy({
	    where : {
		createdAt: {
		    // calculate current date in UTC
		    // and subtrack the 60 min (livetime of resfresh token)
		    [Op.lt]: new Date(Date.parse(new Date().toISOString()) - 60 * 60 * 1000),
		}
	    }
	});
    }
}
