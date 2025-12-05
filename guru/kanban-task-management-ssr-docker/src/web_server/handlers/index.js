// @ts-check

import fs        from "fs";
import path      from "path";
import { JSDOM } from "jsdom";

import { MainHeader }  from "../../../public/pages/index/components/main_header.js";
import { BoardsList }  from "../../../public/pages/index/components/boards_list.js";
import { ControlBtns } from "../../../public/pages/index/components/control_btns.js";
import { Board }       from "../../../public/pages/index/components/board.js";

/**
 * @param {any} req
 * @param {any} res
 * @returns {Promise<any>}
 */
export default async function (req, res) {
  const dir      = "public/pages";
  const subdir   = "index";
  const filename = "index.html";

  fs.readFile(path.resolve(process.cwd(), dir, subdir, filename), "utf-8", async (err, text) => {
    if (err) return res.status(500).json({ error: "File reading error", text: err.message });
    try {
      const cookies = req.headers.cookie;
      if (!cookies) return res.redirect("/auth");

      const cookiesArray = cookies.split('; ').reduce((acc, item) => {
	const [name, value] = item.split('=')
	acc[name] = value
	return acc
      }, {});

      const urlToken    = "http://postgREST:4000/rpc/generate_authz_token";
      const optionToken = {
	method: "POST",
	headers: {	  
	  "Content-Profile": "auth",
	  "Cookie":          `session-uuid=${cookiesArray["session-uuid"]}`
	}
      };

      const responseToken = await fetch(urlToken, optionToken);

      if (responseToken.status === 401) return res.redirect("/auth");
      if (responseToken.status !== 200) return res.status(500).json({
	error: "Server error",
	text:  "genarate_authz_token failed",
      });

      const bearer = await responseToken.json();

      // initialization of global variables
      globalThis.paths            = {};
      globalThis.server_variables = {};
      globalThis.client_variables = {};

      const dom = new JSDOM(text);

      const mainHeader  = dom.window.document.querySelector("main-header");
      const boardsList  = dom.window.document.querySelector("boards-list");
      const controlBtns = dom.window.document.querySelector("control-btns");
      const board       = dom.window.document.querySelector("board");

      if (!mainHeader)  throw new Error("<main-header> is missing");
      if (!boardsList)  throw new Error("<boards-list> is missing");
      if (!controlBtns) throw new Error("<control-btns> is missing");
      if (!board)       throw new Error("<board> is missing");

      const url     = "http://postgREST:4000/rpc/get_initial_data";
      const options = {
	method: "POST",
	headers: { "Authorization": `Bearer ${ bearer }` }
      };

      const response = await fetch(url, options);

      if (response.status !== 200) return res.status(500).json({
	error: "Server error",
	text:  "get_initial_data failed",
      });

      const data         = await response.json();
      const is_anonymous = data.role === "anonymous";

      globalThis.server_variables = {
	boards_list_length: data.boardsList.length,
	is_anonymous:       is_anonymous
      };

      mainHeader.outerHTML  = MainHeader.template(data.boardData);
      boardsList.outerHTML  = BoardsList.template(data.boardsList);
      controlBtns.outerHTML = ControlBtns.template();
      board.outerHTML       = Board.template(data.boardData);

      dom.window.document.body.dataset.paths            = JSON.stringify(globalThis.paths);
      dom.window.document.body.dataset.client_variables = JSON.stringify({ is_anonymous: is_anonymous });

      res.cookie( // update cookie maxAge
	"session-uuid", cookiesArray["session-uuid"],
	{
	  maxAge: 1000 * 60 * 15, // 15 min
	  httpOnly: true,
	  secure: true,
	  sameStrict: "Strict"
	}
      )

      res.send(dom.serialize());
    } catch (error) {
      return res.status(500).json({
	error: "HTML validation error",
	text: error.message,
	stack: error.stack
      });
    }
  });
}
