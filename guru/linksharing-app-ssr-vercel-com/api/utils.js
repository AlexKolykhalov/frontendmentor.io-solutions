// @ts-check

import ejs                 from "ejs";
import path                from "path";
import jwt                 from "jsonwebtoken";
import { readFileSync }    from "fs";
import { IncomingMessage } from "http";

/**
 * @param {string} pathToFile
 * @returns {ejs.TemplateFunction}
 */
export function getCompileEJS(pathToFile) {
  return ejs.compile(
    readFileSync(path.resolve() + pathToFile, "utf-8"),
    { filename: path.resolve() + pathToFile }
  );
}

/**
 * @param {IncomingMessage} request
 */
export function getCookies(request) {
  const cookies = {};
  if (request.headers.cookie) {
    request.headers.cookie.split("; ").forEach((raw) => {
      const [name, value] = raw.split('=');
      cookies[name] = decodeURIComponent(value);
    });
  }

  return cookies;
}

/**
 * @param {{id:string}} payload
 * @returns {string}
 */
export function generateSessionToken(payload) {
  if (!process.env.SECRET_SESSION_TOKEN) throw new Error("SECRET_SESSION_TOKEN is not defined");
  return jwt.sign(payload, process.env.SECRET_SESSION_TOKEN, {expiresIn: "30m"});
}

/**
 * @param {string} token
 * @returns {string|jwt.JwtPayload|null}
 */
export function verifySessionToken(token) {
  try {
    if (!process.env.SECRET_SESSION_TOKEN) throw new Error("SECRET_SESSION_TOKEN is not defined");
    return jwt.verify(token, process.env.SECRET_SESSION_TOKEN);
  } catch (error) {
    return null;
  }
}

