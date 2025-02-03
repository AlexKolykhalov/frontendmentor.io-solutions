//@ts-check

import { resolve } from "path";
import { Router }  from "express";

const router = Router();

router.get("/worker.js",  (_, res) => { res.sendFile(resolve() + "/worker.js"); });

export default router;
