import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { emailValidator, passwordValidator } from "../validators/auth.validator.js";
import { refreshTokenValidator } from "../validators/token.validator.js";

const router = Router();
router.post("/login",  emailValidator, passwordValidator, AuthController.login);
router.post("/signup", emailValidator, passwordValidator, AuthController.signup);
router.get("/refresh", refreshTokenValidator,             AuthController.refresh);

export default router;
