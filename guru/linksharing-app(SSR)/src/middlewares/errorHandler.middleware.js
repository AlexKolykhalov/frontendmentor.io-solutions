//@ts-check

// import ejs from "ejs";
// import path from "path";
// import { readFileSync } from "fs";

import { getCompileEJS } from "../utils.js";

export const errorHandler = (err, _, res, __) => {
  const code = err.status || 500;
  res.format({
    json () {
      res.status(code).json({
	status: code,
	message: err.message || "Internal Server Error",
      });
    },
    html () {      
      if (code === 400)
	return res.status(400).sendFile("html/400.html", { root: "public" });
      if (code === 401) 
	return res.status(401).redirect("/login");
      if (code === 404)
	return res.status(404).sendFile("html/404.html", { root: "public" });      
      const compiled = getCompileEJS("public/templates/500.ejs");
      // console.log(`path.resolve: ${path.resolve()} `);
      // const compiled = ejs.compile(
      // 	readFileSync(path.resolve() + "public/templates/500.ejs", "utf-8"),
      // 	{ filename: path.resolve() + "public/templates/500.ejs" }
      // );
      const html = compiled({error: err.message});
      res.status(500).send(html);
      // 409
    },
  });
};
