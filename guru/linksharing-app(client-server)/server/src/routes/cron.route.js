import { Router } from "express";
import { TokenService } from "../services/token.service.js";
import { cronValidator } from "../validators/cron.validator.js";

const router = Router();
router.get("/clear", cronValidator, async (_, res, next) => {
    try {
	// await TokenService.deleteRefreshTokens();
	// res.sendStatus(200);
	res.status(200).json("From express!!");
    } catch (error) {
	next(error);
    }
});

export default router;
