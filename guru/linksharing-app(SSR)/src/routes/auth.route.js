//@ts-check

import { Router }                            from "express";
import { AuthController }                    from "../controllers/auth.controller.js";
import { emailValidator, passwordValidator } from "../validators/auth.validator.js";
import { refreshTokenValidator }             from "../validators/token.validator.js";

const staticPath = process.env.NODE_ENV === "development" ?
      process.env.DEV_STATIC_FILES_PATH :
      process.env.PROD_STATIC_FILES_PATH;

console.log(staticPath);

const router = Router();

router.post("/api/login",  emailValidator, passwordValidator, AuthController.login);
router.post("/api/signup", emailValidator, passwordValidator, AuthController.signup);
router.get("/api/refresh", refreshTokenValidator,             AuthController.refresh);
router.get("/api/logout",                                     AuthController.logout);

// router.get("/login",  (_, res) => { res.sendFile("html/login.html",  { root: staticPath }); });
router.get("/login",  (_, res) => { res.sendFile("public/html/login.html"); });
router.get("/signup", (_, res) => { res.sendFile("html/signup.html", { root: staticPath }); });

export default router;
