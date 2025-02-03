//@ts-check

import { cookie, header, validationResult } from "express-validator";
import { ServerError } from "../errors/server.error.js";
import { TokenService } from "../services/token.service.js";

export const accessTokenValidator = [
  header("Authorization")
    .exists().withMessage("Authozition header is missing.").bail()
    .custom((value) => value.startsWith("Bearer "))
    .withMessage("Authorization header must start with 'Bearer'.").bail()
    .custom((value, /*{req}*/) => {
      const accessToken = value.split(" ")[1];
      const payload = TokenService.verifyAccessToken(accessToken);
      if (payload === null) throw new Error("Access token expired");
      if (!payload.userId)  throw new Error("Invalid access token");
      // req.userId = payload.userId;
      return true;
    }),
  (req, _, next) => {
    const errors = validationResult(req);
    console.log(`Access token validator errors: ${JSON.stringify(errors.array(), null, 2)}`);
    if (!errors.isEmpty()) return next(ServerError.unauthorized(errors.array()[0].msg));
    next();
  }
];

export const refreshTokenValidator = [
  cookie("_t2")
    .exists().withMessage("Refresh token not found").bail()
    .custom( async (token, /*{req}*/) => {
      const payload = TokenService.verifyRefreshToken(token);
      if (!payload)        return Promise.reject("Refresh token expired");
      if (!payload.userId) return Promise.reject("Invalid refresh token");      
      const dbToken = await TokenService.findRefreshToken(token);
      if (!dbToken)        return Promise.reject("No refresh token");
      // req.userId = payload.userId;
      return Promise.resolve();
    }),
  (req, _, next) => {
    const errors = validationResult(req);
    console.log(`Refresh token validator errors: ${JSON.stringify(errors.array(), null, 2)}`);
    if (!errors.isEmpty()) return next(ServerError.unauthorized(errors.array()[0].msg));
    next();
  }
];
