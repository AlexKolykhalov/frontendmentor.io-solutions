//@ts-check

import { Router }                                      from "express";
import { UserController }                              from "../controllers/user.controller.js";
import { accessTokenValidator, refreshTokenValidator } from "../validators/token.validator.js";
import { userDataValidator, userIdValidator }          from "../validators/user.validator.js";

const router = Router();

router.post("/api/user/update", accessTokenValidator, userDataValidator, UserController.update);

router.get("/new_link",                       UserController.renderLink);
router.get("/preview", refreshTokenValidator, UserController.renderPreview);
router.get("/:userId", userIdValidator,       UserController.renderProfile);
router.get("/",        refreshTokenValidator, UserController.renderIndex);

export default router;
