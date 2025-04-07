// @ts-check

// import fs from "fs";
// import path from "path";

import { serverClient } from "./supabase/serverClient.js";

export default async function (req, res) {
  const supabase = serverClient(req, res);
  
  if (req.url === "/api/auth/signin" && req.method === "GET") {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error('Error signing in:', error.message);
      return res.status(500).json("error");
    }
    res.status(200).json("ok");
  }
  
  if (req.url === "/api/auth/signin" && req.method === "POST") {
    const { email, password } = req.body;    
    // const { data, error } = await supabase.auth.signInWithPassword({
    //   email: "ak@com.com", password: "123123"
    // });
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github"
    });
    if (error) {
      console.error('Error:', error);
      console.error('Error signing in:', error.message);
      return res.status(500).json("error");
    }
    console.log('User signed in:', data.user);
    console.log('User session signed in:', data.session);
    res.status(200).json("ok");
  }

  if (req.url === "/api/auth/signup") {
    const { email, password } = req.body;    
    const { data, error } = await supabase.auth.signUp({
      email: email, password: password
    });
    if (error) {
      console.error('Error:', error);
      console.error('Error signing in:', error.message);
      return res.status(500).json("error");
    }
    console.log('User signed in:', data.user);
    console.log('User session signed in:', data.session);
    res.status(201).json("ok");
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
