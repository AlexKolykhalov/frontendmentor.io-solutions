// @ts-check

import express          from "express";
import { resolve }      from "path";
import cookieParser     from "cookie-parser";
import cors             from "cors";
import router           from "./src/routes/index.route.js";
import { errorHandler } from "./src/middlewares/errorHandler.middleware.js"

const port = process.env.PORT;
const app  = express();
app.use("/public", express.static(resolve("public")));
// app.use(express.static(resolve("public")));
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(router);
app.use(errorHandler);

try {
  app.listen(
    port,
    () => console.log(`Server (${process.env.NODE_ENV}) has been started at port: ${port}...`)
  );
} catch (error) {
  console.error(error);
}

