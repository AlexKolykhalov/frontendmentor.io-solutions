// @ts-check

import { serverClient } from "../functions.js";

/**
 * @param {any} req
 * @param {any} res
 * @returns {Promise<any>}
 */
export default async function (req, res) {
  if (req.method !== "POST") return res.status(405).json("Allow POST");
  
  try {
    const supabase = serverClient(req, res);
    const { email, password } = req.body;
    const { error } = (email && password) ?
	  await supabase.auth.signInWithPassword({ email: email, password: password }) :
	  await supabase.auth.signInAnonymously();

    if (error) return res.status(error.status).json(error.message);
    
    return res.status(200).end();    
  } catch (error) {
    return res.status(500).json(error.message);
  }
}
