import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const filePath = path.resolve() + "/public/html/login.html";
  console.log(filePath);
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      return res.status().json({ error: err });
    }
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(data);  
  });
}
