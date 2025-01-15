//@ts-check

import { Router }                            from "express";
import { AuthController }                    from "../controllers/auth.controller.js";
import { emailValidator, passwordValidator } from "../validators/auth.validator.js";
import { refreshTokenValidator }             from "../validators/token.validator.js";

const router = Router();

router.post("/api/login",  emailValidator, passwordValidator, AuthController.login);
router.post("/api/signup", emailValidator, passwordValidator, AuthController.signup);
router.get("/api/refresh", refreshTokenValidator,             AuthController.refresh);
router.get("/api/logout",                                     AuthController.logout);

router.get("/login",  (_, res) => { res.sendFile("html/login.html",  { root: "public" }); });
router.get("/signup", (_, res) => { res.sendFile("html/signup.html", { root: "public" }); });

export default router;
