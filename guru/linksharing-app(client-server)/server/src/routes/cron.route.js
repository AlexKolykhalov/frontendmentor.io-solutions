import { Router } from "express";
import { TokenService } from "../services/token.service.js";
import { cronValidator } from "../validators/cron.validator.js";

const router = Router();
router.get("/cron", cronValidator, async (_, res) => {
    // try {
    // 	await TokenService.deleteRefreshTokens();
    // 	res.status(200).json("ok");
    // } catch (error) {
    // 	next(error);
    // }
    await TokenService.deleteRefreshTokens();
    res.status(200).json("ok");
});

export default router;
