// @ts-check

import fs        from "fs";
import path      from "path";

export default async function (_, res) {
  fs.readFile(`${path.resolve()}/public/pages/login/login.html`, "utf-8", async (err, text) => {
    if (err) return res.status(500).json({ error: "File reading error", text: err.message });
    res.send(text);
  });
}
