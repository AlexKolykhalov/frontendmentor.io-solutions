// @ts-check

import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import db from "../database/models/index.js";
import { UserService } from "../services/user.service.js";
import { TokenService } from "../services/token.service.js";
import { ServerError } from "../errors/server.error.js";

/**
 * @typedef { import("../types/typedefs.js").Authentication } Authentication
 * @typedef { import("../types/typedefs.js").User }           User
 * @typedef { import("../types/typedefs.js").Payload }        Payload
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
    const dbAuth = await AuthService.#findAuthentication(email);
    if (!dbAuth) throw ServerError.unauthorized("Email and Password don't match.");
    const result = await AuthService.#verify(password, dbAuth.password);    
    if (!result) throw ServerError.unauthorized("Email and Password don't match.");
    /** @type {Payload} */
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
      const dbAuth = await AuthService.#findAuthentication(email);
      if (dbAuth) throw ServerError.conflict(
	"Registration could not be completed. If you have an account, please log in."
      );
      const user = await UserService.createUser();
      /** @type {Payload} */
      const payload = {userId: user.userId, email: email};
      await AuthService.#createAuthentication(email, password, payload.userId);
      tokens = TokenService.generateTokens(payload);
      await TokenService.createRefreshToken(tokens.refresh, payload.userId);
    });

    return tokens;
  }

  /**
   * @async
   * @param {string} token
   * @returns {Promise<{access:string, refresh:string}>}
   * @throws {ServerError} Throws ServerError.unauthorized or Error
   */
  static async refresh(token) {
    // get new user info (just in case)
    const user = await UserService.findByUserToken(token);
    if (!user) throw ServerError.unauthorized("User has been deleted");
    const tokens = TokenService.generateTokens({userId: user.userId, email: user.email});
    await TokenService.updateRefreshToken(tokens.refresh, token);

    return tokens;
  }

  /**
   * @async
   * @param {string} token
   * @returns {Promise<void>}
   */
  static async logout(token) {
    await TokenService.deleteRefreshToken(token);
  }

  /**
   * @async
   * @param {string} email
   * @param {string} password
   * @param {string} userId
   * @returns {Promise<void>}
   */
  static async #createAuthentication(email, password, userId) {
    const strongPassword = await this.#hash(password);    
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
  static async #findAuthentication(email) {
    return await db.Authentication.findOne({ where: {email: email} });
  }

  /**
   * Creates hash from password
   * @async
   * @param {string} password
   */
  static async #hash(password) {
    const salt          = randomBytes(16).toString("hex");
    const scryptPromise = promisify(scrypt);
    const derivedKey    = await scryptPromise(password, salt, 64);
    return `${salt}:${derivedKey.toString("hex")}`;
  }

  /**
   * Checks the password & hash for equality
   * @async
   * @param {string} password
   * @param {string} hash
   */
  static async #verify(password, hash) {
    const [salt, key]   = hash.split(":");
    const keyBuffer     = Buffer.from(key, "hex");
    const scryptPromise = promisify(scrypt);
    const deriveKey     = await scryptPromise(password, salt, 64);
    return timingSafeEqual(keyBuffer, deriveKey);
  }
}

