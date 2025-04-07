// @ts-check

import fs        from "fs";
import path      from "path";
import { JSDOM } from "jsdom";

import { serverClientServiceRole } from "../db/supabase/serverClient.js"

import { Board }      from "../../public/pages/index/components/board.js";
import { BoardsList } from "../../public/pages/index/components/boards_list.js";
import { insert }     from "../../public/pages/index/components/helpers.js";

export default async function (req, res) {
  // const supabase = serverClientServiceRole(req, res);
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) res.status(401).json("Unauthorized");

  fs.readFile(`${path.resolve()}/public/pages/index/index.html`, "utf-8", async (err, text) => {
    if (err) return res.status(500).json({ error: "File reading error", text: err.message });
    try {
      const supabase = serverClientServiceRole(req, res);
      const { data, error } = await supabase.rpc("get_boards");
      if (error) return res.status(500).json({ error: "Server error", text: error.message });
      const dom = new JSDOM(text);
      insert(
	Board.template(data[0]),
	"board",
	dom.window.document
      );
      insert(
	BoardsList.template(data),
	"boards-list",
	dom.window.document
      );
      res.send(dom.serialize());
    } catch (error) {
      return res.status(500).json({ error: "HTML validation error", text: error.message });
    }
  });
}
