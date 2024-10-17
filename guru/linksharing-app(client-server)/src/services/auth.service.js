// @ts-check

import { compare, hash } from "bcrypt";
import db from "../database/models/index.js";
import { UserService } from "../services/user.service.js";
import { TokenService } from "../services/token.service.js";
import { ServerError } from "../errors/server.error.js";

/**
 * @typedef { import("../types/typedefs.js").Authentication } Authentication
 * @typedef { import("../types/typedefs.js").User } User
 */

/**
 * @class
 */
export class AuthService {
    /**
     * @async
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{access:string, refresh:string}>}
     * @throws {ServerError} Throws ServerError.unauthorized
     */
    static async login(email, password) {
	const dbAuth = await AuthService.findAuthentication(email);
	if (!dbAuth) throw ServerError.unauthorized("Email and Password don't match.");
	const result = await compare(password, dbAuth.password);
	if (!result) throw ServerError.unauthorized("Email and Password don't match.");
	// TODO types
	const payload = {userId: dbAuth.userId, email: dbAuth.email};	
	const tokens = TokenService.generateTokens(payload);
	await TokenService.createRefreshToken(tokens.refresh, payload.userId);
	return tokens;
    }

    /**
     * @async
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{access:string, refresh:string}>}
     * @throws {ServerError} Throws ServerError.conflict
     */
    static async signup(email, password) {
	let tokens = {access: "", refresh: ""};
	await db.sequelize.transaction(async () => {
	    const dbAuth = await AuthService.findAuthentication(email);
	    if (dbAuth) throw ServerError.conflict(
		"Registration could not be completed. If you have an account, please log in."
	    );	    
	    const user = await UserService.createUser();
	    const payload = {userId: user.userId, email: email};
	    await AuthService.createAuthentication(email, password, payload.userId);
	    tokens = TokenService.generateTokens(payload);
	    await TokenService.createRefreshToken(tokens.refresh, payload.userId);
	});

	return tokens;
    }

    /**
     * @async
     * @param {{userId:string, token:string}} dbToken
     * @returns {Promise<{access:string, refresh:string}>}
     * @throws {ServerError} Throws ServerError.unauthorized or Error
     */
    static async refresh(dbToken) {
	// get new user info (just in case)
	const user = await UserService.findByUserId(dbToken.userId);
	if (!user) throw ServerError.unauthorized("User has been deleted");
	const tokens = TokenService.generateTokens({userId: user.userId, email: user.email});
	await TokenService.updateRefreshToken(tokens.refresh, dbToken.token);

	return tokens;
    }

    /**
     * @async
     * @param {string} token
     * @returns {Promise<void>}
     */
    static async logout(token) {
	const deleted = await db.UserToken.destroy({
	    where: { token: token }
	});
	if (deleted === 0) throw Error("Can't find token in DB.");
    }

    /**
     * @async
     * @param {string} email
     * @param {string} password
     * @param {string} userId
     * @returns {Promise<void>}
     */
    static async createAuthentication(email, password, userId) {
	const strongPassword = await hash(password, 10);
	await db.Authentication.create({
	    email:    email,
	    password: strongPassword,
	    userId:   userId
	});
    }

    /**
     * @async
     * @param {string} email
     * @returns {Promise<Authentication|null>}
     */
    static async findAuthentication(email) {
	return await db.Authentication.findOne({ where: {email: email} });
    }
}
