// @ts-check

import jwt from "jsonwebtoken";
import db from "../database/models/index.js";

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
	const refreshToken = jwt.sign(payload, SECRET_REFRESH_TOKEN, {expiresIn: "60m"});
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
	//TODO check if return null
	return await db.UserToken.findOne({
	    attributes: ["token", "userId"],
	    where: {token: token}
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
 	    { token: newToken},
	    { where:
	      {token: oldToken}
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
}
