// @ts-check

import { Router }   from "express";
import authRouter   from "./auth.route.js";
import userRouter   from "./user.route.js";
import cronRouter   from "./cron.route.js";
import workerRouter from "./worker.route.js";

const router = Router();

// the orders of routers matters
router.use(authRouter);
router.use(cronRouter);
router.use(workerRouter);
router.use(userRouter);

export default router;
