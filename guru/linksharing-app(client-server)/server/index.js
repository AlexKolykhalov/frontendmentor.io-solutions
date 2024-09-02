// @ts-check

import express from "express";
import path from "path";

import router from "./src/routes/index.route.js";


const __rootname = path.resolve(path.resolve(), "..");
const port = process.env.PORT;
const app = express();
app.use(express.static(path.resolve(__rootname, "client")));
app.use(express.json());
app.use(router);
app.use((_, res) => res.status(404).send("Not found here"));

app.listen(port, () => console.log(`Server has been started at port: ${port}...`));
