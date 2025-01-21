// @ts-check

import express from "express";
import { UserService } from "../services/user.service.js";
import { ServerError } from "../errors/server.error.js";
import { getCompileEJS } from "../utils.js";
import { getLinkInfoByName } from "../../public/helpers.js";

/**
 * @class
 */
export class UserController {
  /**
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {express.NextFunction} next
   */
  static async update(req, res, next) {
    try {
      const userData = req.body;
      const user = await UserService.updateUser(userData);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {express.NextFunction} next
   */
  static async renderIndex(req, res, next) {
    try {
      const user = await UserService.findByUserToken(req.cookies["_t2"]);
      if (!user) throw ServerError.notFound();
      const links = user.links.map(item => {
	const { domain, whiteIcon, grayIcon, bgColor, offset } = getLinkInfoByName(item.source);
	return {
	  id: item.linkId,
	  domain: domain,
	  whiteIcon: whiteIcon,
	  grayIcon: grayIcon,
	  bgColor: bgColor,
	  offset: offset,
	  url: item.url,
	  source: item.source };
      });      
      const compiled = getCompileEJS("/public/templates/index.ejs");
      const html = compiled({ user: user, links: links });
      return res.format({
	json () { return res.json(user) },
	html () { return res.send(html) },
      });
    } catch (error) {      
      next(error);
    }
  }

  /**
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {express.NextFunction} next
   */
  static async renderProfile(req, res, next) {
    try {
      const user = await UserService.findByUserId(req.params.userId);
      if (!user) throw ServerError.notFound();
      const links = user.links.map(item => {
	const { domain, whiteIcon, bgColor } = getLinkInfoByName(item.source);
	return { domain: domain,
		 whiteIcon: whiteIcon,
		 bgColor: bgColor,
		 url: item.url,
		 source: item.source };
      });
      const compiled = getCompileEJS("/public/templates/profile.ejs");
      const html     = compiled({ user: user, userLinks: links });
      return res.format({
	json () { return res.json(user) },
	html () { return res.send(html) },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {express.NextFunction} next
   */
  static async renderPreview(req, res, next) {
    try {
      const user = await UserService.findByUserToken(req.cookies["_t2"]);
      if (!user) throw ServerError.notFound();
      const links = user.links.map(item => {
	const { domain, whiteIcon, bgColor } = getLinkInfoByName(item.source);
	return { domain: domain,
		 whiteIcon: whiteIcon,
		 bgColor: bgColor,
		 url: item.url,
		 source: item.source };
      });
      const compiled = getCompileEJS("/public/templates/preview.ejs");
      const html     = compiled({ user: user, userLinks: links });
      return res.format({
	json () { return res.json(user) },
	html () { return res.send(html) },
      });
    } catch (error) {
      next(error);
    }
  }
}
