import fs   from "fs";
import path from "path";

export default function (_, res) {
  fs.readFile(path.resolve() + "/worker.js", "utf-8", (err, data) => {
    if (err) {
      fs.readFile(path.resolve() + "/public/pages/404/404.html", "utf-8", (err, data) => {
	if (err) return res.status(404).send({ error: "Not found" });
	return res.send(data);
      });
    }
    res.setHeader("Content-Type", "application/javascript");
    res.send(data);
  });
}
