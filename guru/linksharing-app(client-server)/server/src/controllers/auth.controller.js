// @ts-check
import express from "express";
import { AuthService } from "../services/auth.service.js";

/**
 * @class
 */
export class AuthController {
    /**
     * @param {express.Request} req
     * @param {express.Response} res
     * @param {express.NextFunction} next
     */
    static async login(req, res, next) {
	try {
	    const { email, password } = req.body;
	    const tokens = await AuthService.login(email, password);
	    res.cookie("_t2", tokens.refresh, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production"
	    });
	    return res.status(200).json(tokens.access);
	} catch (error) {
	    next(error);
	}
    }

    /**
     * @param {express.Request} req
     * @param {express.Response} res
     * @param {express.NextFunction} next
     */
    static async signup(req, res, next) {
	try {
	    const { email, password } = req.body;
	    const tokens = await AuthService.signup(email, password);
	    res.cookie("_t2", tokens.refresh, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production"
	    });
	    return res.status(201).json(tokens.access);
	} catch (error) {
	    next(error);
	}
    }

    /**
     * @param {express.Request} req
     * @param {express.Response} res
     * @param {express.NextFunction} next
     */
    static async refresh(req, res, next) {
	try {
	    const tokens = await AuthService.refresh(req.dbToken); // see in refreshTokenValidator
	    res.cookie("_t2", tokens.refresh, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production"
	    });
	    return res.status(200).json(tokens.access);
	} catch (error) {
	    next(error);
	}
    }
}
