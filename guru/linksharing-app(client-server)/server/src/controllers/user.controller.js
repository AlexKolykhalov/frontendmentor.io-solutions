// @ts-check
import express from "express";
import { UserService } from "../services/user.service.js";

/**
 * @class
 */
export class UserController {
    /**
     * @param {express.Request} req
     * @param {express.Response} res
     * @param {express.NextFunction} next
     */
    static async get(req, res, next) {
	try {
	    // console.log(req.socket.remoteAddress);
	    // console.log(req.headers["user-agent"]);
	    // console.log(`req.userId: ${req.userId}`);
	    const user = await UserService.findByUserId(
		req.params.userId ? req.params.userId : req.userId // see in accessTokenValidator
	    );
	    return res.status(200).json(user);
	} catch (error) {
	    next(error);
	}
    }

    /**
     * @param {express.Request} req
     * @param {express.Response} res
     * @param {express.NextFunction} next
     */
    static async update(req, res, next) {
	try {
	    const userData = req.body;
	    const user = await UserService.updateUser(userData);
	    return res.status(200).json(user);
	} catch (error) {
	    next(error);
	}
    }
}
