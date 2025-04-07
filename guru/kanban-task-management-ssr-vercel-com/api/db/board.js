// @ts-check

import fs from "fs";
import path from "path";

import { serverClientServiceRole } from "../db/supabase/serverClient.js"

export default async function (req, res) {
  if (req.method === "GET") {
    const supabase = serverClientServiceRole(req, res);
    const { data, error } = await supabase.rpc("get_boards");
    if (error) return res.status(500).json(error);
    res.status(200).json(data);
  }
  
  if (req.method === "POST") {
    const supabase = serverClientServiceRole(req, res);
    const { data, error } = await supabase.rpc("create_board", { board: req.body });
    if (error) return res.status(500).json(error);
    res.status(201).json(data);
  }
  
  if (req.method === "UPDATE") {
    const supabase = serverClientServiceRole(req, res);
    const { data, error } = await supabase.rpc("update_board", { board: req.body });
    if (error) return res.status(500).json(error);
    res.status(200).json(data);
  }
  
  if (req.method === "DELETE") {
    res.status(200).json("board deleted");
  }
  
  // fs.readFile(`${path.resolve()}/public/data.json`, (err, data) => {
  //   if (err) res.status(500).json(`File reading error: ${err}`);
  //   try {
  //     const json = JSON.parse(data);
  //     json.boards.push(req.body);
  //     fs.writeFile(
  // 	`${path.resolve()}/public/data.json`,
  // 	JSON.stringify(json, null, 2),
  // 	function(err) {
  // 	  if (err) res.status(500).json(`File write error: ${err}`);
  // 	  res.status(201).json("success");
  // 	});
  //   } catch (error) {
  //     if (err) res.status(500).json(`File parsing error: ${err}`);
  //   }
  // });

  // const [auth] = await sql`select user_id, password from "Authentications" where email = ${email}`;
  // if (!auth) return res.status(401).send({ message: "Email and Password don't match." });

  // if (!isEqual) return res.status(401).send({ message: "Email and Password don't match." });
  // const token = generateSessionToken({ id: auth.user_id });
  // res.setHeader(
  //   "Set-Cookie", `session=${token}; HttpOnly; SameSite=Lax; Secure; Path=/; Max-Age=1800`
  // );

}
