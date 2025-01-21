//@ts-check

import { body, validationResult } from "express-validator";
import { ServerError } from "../errors/server.error.js";

export const emailValidator = [
    body("email").trim().isEmail(),
    (req, _, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty())
	    return next(ServerError.badRequest("Invalid email."));
	next();
    }
];

export const passwordValidator = [
    body("password").isLength({min: 6, max: 20}),
    (req, _, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty())
	    return next(ServerError.badRequest("Password must be from 6 to 20 symbols."));
	next();
    }
];

