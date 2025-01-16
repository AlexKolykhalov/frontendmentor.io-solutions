//@ts-check

import { getCompileEJS } from "../utils.js";

const staticPath = process.env.NODE_ENV === "development" ?
      process.env.DEV_STATIC_FILES_PATH :
      process.env.PROD_STATIC_FILES_PATH;

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
	return res.status(400).sendFile("html/400.html", { root: staticPath });
      if (code === 401)
	return res.status(401).redirect("/login");
      if (code === 404)
	// return res.status(404).sendFile("html/404.html", { root: staticPath });
	return res.status(404).sendFile("/var/task/public/html/404.html");	
      const compiled = getCompileEJS("public/templates/500.ejs");
      const html = compiled({error: err.message});
      res.status(500).send(html);
      // 409
    },
  });
};
