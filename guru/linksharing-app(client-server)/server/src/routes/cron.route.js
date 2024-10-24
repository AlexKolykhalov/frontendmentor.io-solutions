import { Router } from "express";
import { TokenService } from "../services/token.service.js";

const router = Router();
router.get("/clear", async (_, res, next) => {
    try {
	await TokenService.deleteRefreshTokens();
	res.sendStatus(200);
    } catch (error) {
	next(error);
    }
});

export default router;
