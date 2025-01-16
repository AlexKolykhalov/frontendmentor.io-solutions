//@ts-check

import path from "path";
import { readFileSync } from "fs";

import { Router }                            from "express";
import { AuthController }                    from "../controllers/auth.controller.js";
import { emailValidator, passwordValidator } from "../validators/auth.validator.js";
import { refreshTokenValidator }             from "../validators/token.validator.js";

const staticPath = process.env.NODE_ENV === "development" ?
      process.env.DEV_STATIC_FILES_PATH :
      process.env.PROD_STATIC_FILES_PATH;

console.log(staticPath);
console.log(`path: ${path.resolve(process.cwd(), "public")}`);
console.log(`path of login:${path.resolve() + "/public/html/login.html"}`);

const router = Router();

router.post("/api/login",  emailValidator, passwordValidator, AuthController.login);
router.post("/api/signup", emailValidator, passwordValidator, AuthController.signup);
router.get("/api/refresh", refreshTokenValidator,             AuthController.refresh);
router.get("/api/logout",                                     AuthController.logout);

// router.get("/login",  (_, res) => { res.sendFile("html/login.html",  { root: staticPath }); });
router.get("/login",  (_, res) => { res.sendFile("/var/task/guru/linksharing-app(SSR)/dist/html/login.html"); });
// const html = readFileSync(path.resolve() + "/public/html/login.html", "utf-8");
// router.get("/login",  (_, res) => { res.send(html) });
router.get("/signup", (_, res) => { res.sendFile("html/signup.html", { root: staticPath }); });

export default router;
