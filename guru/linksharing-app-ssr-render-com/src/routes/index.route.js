// @ts-check

import { Router }   from "express";
import authRouter   from "./auth.route.js";
import userRouter   from "./user.route.js";
import cronRouter   from "./cron.route.js";
import workerRouter from "./worker.route.js";

const router = Router();

router.use(authRouter);
router.use(cronRouter);
router.use(userRouter);
router.use(workerRouter);

export default router;
