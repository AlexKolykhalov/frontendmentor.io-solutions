import { body, validationResult } from "express-validator";


const checkEmailPassword = [
    body("email").isEmail(),
    body("password").isLength({min: 6, max: 20}),
    (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
	    res.setHeader("Content-Type", "application/json");
	    res.status(400).send(JSON.stringify({"errors": errors.array()}, null, 2));
	}
	next();
    }
];

const checkToken = [
    body("token").isJWT(),
    (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
	    res.setHeader("Content-Type", "application/json");
	    res.status(400).send(JSON.stringify({"errors": errors.array()}, null, 2));
	}
	next();
    }
];


export { checkEmailPassword, checkToken };
