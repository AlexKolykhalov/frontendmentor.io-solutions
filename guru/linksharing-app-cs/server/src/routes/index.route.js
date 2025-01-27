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

router.get("/login", (_, res) => {
  // res.sendFile("pages/login/login.html", { root: root });
  res.sendFile(path.resolve("guru", "linksharing-app-cs", "client", "pages", "login", "login.html"));
});
router.get("/signup", (_, res) => {
  res.sendFile(path.resolve(__dirname, "client", "pages", "signup", "signup.html"));
});
router.get("/preview", (_, res) => {
  res.sendFile(path.resolve(__dirname, "client", "pages", "preview", "preview.html"));
});
router.get("/404", (_, res) => {
  res.sendFile(path.resolve(__dirname, "client", "pages", "404", "404.html"));
});
router.get("/:userId", (_, res) => {
  res.sendFile(path.resolve(__dirname, "client", "pages", "profile", "profile.html"));
});
router.get("/", (_, res) => {  
  // res.sendFile("pages/index/index.html", { root: root });
  res.sendFile(path.resolve("guru", "linksharing-app-cs", "client", "pages", "login", "login.html"));
});

export default router;
