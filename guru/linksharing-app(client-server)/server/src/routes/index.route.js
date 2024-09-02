import { Router } from "express";
import path from "path";

import authRouter from "./auth.route.js";


const __rootname = path.resolve(path.resolve(), "..");
const router = Router();

router.use("/api", authRouter);

router.get("/", (_, res) => {
    res.sendFile(path.resolve(__rootname, "client", "index.html"));
});

router.get("/login", (_, res) => {
    res.sendFile(path.resolve(__rootname, "client", "login.html"));
});

router.get("/signup", (_, res) => {
    res.sendFile(path.resolve(__rootname, "client", "signup.html"));
});


export default router;
