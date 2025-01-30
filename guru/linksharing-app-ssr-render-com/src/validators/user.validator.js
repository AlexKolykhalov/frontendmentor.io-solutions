//@ts-check

import { body, param, validationResult } from "express-validator";
import { ServerError } from "../errors/server.error.js";

export const userDataValidator = [
    body("avatar").exists().withMessage("Avatar is required"),
    body("email")
    	.exists().withMessage("Email is required").bail()
	.optional({ values: "falsy" }).isEmail().withMessage("Invalid email address"),
    body("links")
    	.exists().withMessage("Links is required").bail()
	.isArray().withMessage("Links must be an array"),
    body("links.*.id").exists().withMessage("Each link must have a 'id' field"),
    body("links.*.url").exists().withMessage("Each link must have a 'url' field"),
    body("name")
	.exists().withMessage("Name is required").bail()
	.notEmpty().withMessage("Name is empty").bail()
	.custom((value) => {
	    if (value.trim().split(" ").length > 2) throw new Error("Name must contain only first and last name");
	    if (!value.trim().split(" ")[1]) throw new Error("First/Last name is required");
	    return true;
	}),
    (req, _, next) => {
	const errors = validationResult(req);
	console.log(`User data validator errors: ${JSON.stringify(errors.array(), null, 2)}`);
	if (!errors.isEmpty())
	    return next(ServerError.badRequest(errors.array()[0].msg));
	next();
    }
];

export const userIdValidator = [
    param("userId")
	.exists().withMessage("UserId is required")
	.isUUID().withMessage("Invalid format of userId"),
    (req, res, next) => {
	const errors = validationResult(req);
	console.log(`UserId data validator errors: ${JSON.stringify(errors.array(), null, 2)}`);
	if (!errors.isEmpty())
	    return next(ServerError.badRequest(errors.array()[0].msg));
	next();	
    }
];
