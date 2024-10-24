import { header, validationResult } from "express-validator";
import { ServerError } from "../errors/server.error.js";

export const cronValidator = [
    header("Authorization")
	.exists().withMessage("Authozition header is missing.").bail()
	.custom((value) => value.startsWith("Bearer "))
	.withMessage("Authorization header must start with 'Bearer'.").bail()
	.custom((value) => {
	    const cronSecret = value.split(" ")[1];	    
	    if (cronSecret !== process.env.CRON_SECRET) throw new Error("Invalid cron secret");
	    return true;
	}),
    (req, _, next) => {
	const errors = validationResult(req);
	console.log(`Cron secret validator errors: ${JSON.stringify(errors.array(), null, 2)}`);
	if (!errors.isEmpty())
	    return next(ServerError.unauthorized(errors.array()[0].msg));
	next();
    }
];
