import { Router } from "express";
import path       from "path";
import authRouter from "./auth.route.js";
import userRouter from "./user.route.js";
import cronRouter from "./cron.route.js";

const root = process.env.NODE_ENV === "development" ?
      path.resolve("..", "client"):
      path.resolve("guru", "linksharing-app-cs", "client");

console.log(`my root path: ${root}`);

const router    = Router();

router.use("/api", authRouter);
router.use("/api", cronRouter);
router.use("/api", userRouter);

router.get("/login",   (_, res) => { res.sendFile("pages/login/login.html",     { root: root }); });
router.get("/signup",  (_, res) => { res.sendFile("pages/signup/signup.html",   { root: root }); });
router.get("/preview", (_, res) => { res.sendFile("pages/preview/preview.html", { root: root }); });
router.get("/404",     (_, res) => { res.sendFile("pages/404/404.html",         { root: root }); });
router.get("/:userId", (_, res) => { res.sendFile("pages/profile/profile.html", { root: root }); });
router.get("/",        (_, res) => { res.sendFile("pages/index/index.html",     { root: root }); });

export default router;
