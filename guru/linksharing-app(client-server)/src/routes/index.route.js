import { Router } from "express";
import path       from "path";
import authRouter from "./auth.route.js";
import userRouter from "./user.route.js";

const __rootname = path.resolve(path.resolve(), "..");
// const __dirname = path.resolve();
const router     = Router();

router.use("/api",      authRouter);
router.use("/api/user", userRouter);
router.get("/login", (_, res) => {
    res.sendFile(path.resolve(__rootname, "client", "pages", "login", "login.html"));
    // res.sendFile(path.resolve(__dirname, "client", "pages", "login", "login.html"));
});
router.get("/signup", (_, res) => {
    res.sendFile(path.resolve(__rootname, "client", "pages", "signup", "signup.html"));
    // res.sendFile(path.resolve(__dirname, "client", "pages", "signup", "signup.html"));
});
router.get("/preview", (_, res) => {
    res.sendFile(path.resolve(__rootname, "client", "pages", "preview", "preview.html"));
    // res.sendFile(path.resolve(__dirname, "client", "pages", "preview", "preview.html"));
});
router.get("/404", (_, res) => {
    res.sendFile(path.resolve(__rootname, "client", "pages", "404", "404.html"));
    // res.sendFile(path.resolve(__dirname, "client", "pages", "404", "404.html"));
});
router.get("/:userId", (_, res) => {    
    res.sendFile(path.resolve(__rootname, "client", "pages", "profile", "profile.html"));
    // res.sendFile(path.resolve(__dirname, "client", "pages", "profile", "profile.html"));
});
router.get("/", (_, res) => {
    res.sendFile(path.resolve(__rootname, "client", "pages", "index", "index.html"));
    // res.sendFile(path.resolve(__dirname, "client", "pages", "index", "index.html"));
});

export default router;
