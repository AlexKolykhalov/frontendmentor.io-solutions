import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { accessTokenValidator } from "../validators/token.validator.js";
import { userDataValidator, userIdValidator } from "../validators/user.validator.js";

const router = Router();
router.get("/",        accessTokenValidator,                    UserController.get);
router.get("/:userId", userIdValidator,                         UserController.get);
router.post("/update", accessTokenValidator, userDataValidator, UserController.update);

export default router;
