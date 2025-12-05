// @ts-check

import express from "express";

import index from "./handlers/index.js";
import auth  from "./handlers/auth.js";

import signin  from "./api/v1/signin.js";
import signup  from "./api/v1/signup.js";
import signout from "./api/v1/signout.js";
import bearers from "./api/v1/bearers.js";

import boards   from "./api/v1/boards.js";
import tasks    from "./api/v1/tasks.js";
import subtasks from "./api/v1/subtasks.js";
import users    from "./api/v1/users.js";

const app = express();
app.use(express.json());

app.get("/",     index);
app.get("/auth", auth);

app.use("/v1/signin",  signin);
app.use("/v1/signup",  signup);
app.use("/v1/signout", signout);

app.use("/v1/bearers/generate",     bearers);
app.use("/v1/boards/:uuid",         boards);
app.use("/v1/boards",               boards);
app.use("/v1/tasks/:uuid",          tasks);
app.use("/v1/tasks",                tasks);
app.use("/v1/subtasks/:uuid",       subtasks);
app.use("/v1/users/delete_current", users);

app.listen(3000, () => {
  console.log(`Express has been started at port: 3000`);
});
