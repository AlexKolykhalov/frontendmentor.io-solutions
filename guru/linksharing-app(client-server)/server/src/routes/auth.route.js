import { Router } from "express";

import { AuthController } from "../controllers/auth.controller.js";
import { checkEmailPassword, checkToken } from "../middlewares/index.middleware.js";


const router = Router();
router.post("/login", checkEmailPassword, AuthController.login);
router.post("/signup", checkEmailPassword, AuthController.signup);
router.post("/logout", checkToken, AuthController.logout);


export default router;
