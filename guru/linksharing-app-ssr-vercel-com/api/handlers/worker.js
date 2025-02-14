import fs   from "fs";
import path from "path";

export default function (_, res) {
  fs.readFile(`${path.resolve()}/worker.js`, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "File reading error", text: err.message });
    res.setHeader("Content-Type", "application/javascript");
    res.send(data);
  });
}
