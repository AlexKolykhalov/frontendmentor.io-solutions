// @ts-check

import express from "express";
import path from "path";
import cookieParser from 'cookie-parser';
import db from "./src/database/models/index.js";
import router from "./src/routes/index.route.js";
import { errorHandler } from "./src/middlewares/errorHandler.middleware.js"

const port = process.env.PORT;
const app = express();

const staticPath = process.env.NODE_ENV === "development" ?
      path.resolve("..", "client"):
      path.resolve("client");

console.log(`my static path: ${staticPath}`);

app.use("/client", express.static(staticPath));
app.use(express.json());
app.use(cookieParser());
app.use(router);
app.use(errorHandler);

try {    
    await db.sequelize.authenticate();
    app.listen(port, () => console.log(`Server (${process.env.NODE_ENV}) has been started at port: ${port}...`));
} catch (error) {
    console.error(error);
}

