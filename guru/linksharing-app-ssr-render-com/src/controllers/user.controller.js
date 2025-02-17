// @ts-check

import express from "express";
import { UserService } from "../services/user.service.js";
import { ServerError } from "../errors/server.error.js";
import { getCompileEJS } from "../utils.js";
import { getParams } from "../../public/helpers.js";

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
      user.links = user.links.map((item) => {
	return {
	  id: item.id,
	  number: user.links.indexOf(item) + 1,
	  url: item.url,
	  params: getParams(new URL(item.url).hostname) };
      });

      const compiled = getCompileEJS("/src/views/index.ejs");
      const html     = compiled({ user: user });      
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
      user.links = user.links.map(item => {
	return {
	  id: item.id,
	  number: user.links.indexOf(item) + 1,
	  url: item.url,
	  params: getParams(new URL(item.url).hostname) };
      });
      
      const compiled = getCompileEJS("/src/views/profile.ejs");
      const html     = compiled({ user: user });
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
      user.links = user.links.map(item => {
	return {
	  id: item.id,
	  number: user.links.indexOf(item) + 1,
	  url: item.url,
	  params: getParams(new URL(item.url).hostname) };
      });

      const compiled = getCompileEJS("/src/views/preview.ejs");
      const html     = compiled({ user: user });
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
  static renderLink(req, res, next) {
    const compiled = getCompileEJS("/src/views/link.ejs");

    return res.send(
      compiled({
	link: {
	  number: req.query.number,
	  id: req.query.id,
	  url: req.query.url,
	  params: getParams(new URL(req.query.url).hostname),
	}
      })
    );
  }

}
