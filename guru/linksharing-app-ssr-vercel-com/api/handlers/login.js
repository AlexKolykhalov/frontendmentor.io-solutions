import ejs  from "ejs";
import path from "path";
// import { readFileSync } from "fs";

export default function (_, res) {
  // ejs.renderFile(`${path.resolve()}/public/pages/login/login.ejs`, { views: `${path.resolve()}/public/pages/login/login.ejs` }, (err, str) => {
  //   if (err) return res.status(500).json({ error: "EJS render error", text: err.message });
  //   res.send(str);
  // });
  console.log(`my path: ${path.resolve()}/public/pages/login/login.ejs`);
  const compile =  ejs.compile(
    readFileSync(`${path.resolve()}/public/pages/login/login.ejs`, "utf-8"),
    { filename: `${path.resolve()}/public/pages/login/login.ejs` }
  );


  res.send(compile());
}
