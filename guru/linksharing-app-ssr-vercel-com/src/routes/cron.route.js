//@ts-check

import { Router } from "express";
import { TokenService } from "../services/token.service.js";
import { cronValidator } from "../validators/cron.validator.js";

const router = Router();

router.get("/api/cron", cronValidator, async (_, res) => {
    await TokenService.deleteRefreshTokens();
    res.status(200).json("ok");
});

export default router;
