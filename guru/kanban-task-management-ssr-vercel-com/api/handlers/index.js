// @ts-check

import fs        from "fs";
import path      from "path";
import { JSDOM } from "jsdom";

import { serverClient } from "../functions.js";

import { MainHeader }  from "../../public/pages/index/components/main_header.js";
import { BoardsList }  from "../../public/pages/index/components/boards_list.js";
import { ControlBtns } from "../../public/pages/index/components/control_btns.js";
import { Board }       from "../../public/pages/index/components/board.js";

export default async function (req, res) {
  fs.readFile(`${path.resolve()}/public/pages/index/index.html`, "utf-8", async (err, text) => {
    if (err) return res.status(500).json({ error: "File reading error", text: err.message });
    try {
      const supabase = serverClient(req, res);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return res.redirect("/auth");

      // initialization of global variables
      globalThis.paths = {};
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

      const { data, error } = await supabase.rpc("get_initial_data");
      console.log(error);
      if (error) return res.status(500).json({
	error: "Server error",
	text: "get_initial_data failed",
      });

      globalThis.server_variables = {
	boards_list_length: data.boardsList.length,
	is_anonymous:       user.is_anonymous
      };

      mainHeader.outerHTML  = MainHeader.template(data.boardData);
      boardsList.outerHTML  = BoardsList.template(data.boardsList);
      controlBtns.outerHTML = ControlBtns.template();
      board.outerHTML       = Board.template(data.boardData);

      dom.window.document.body.dataset.paths            = JSON.stringify(globalThis.paths);
      dom.window.document.body.dataset.client_variables = JSON.stringify({ is_anonymous: user.is_anonymous });

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
