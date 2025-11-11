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
    const authResp = await supabase.auth.signUp({ email: email, password: password });
    if (authResp.error) return res.status(authResp.error.status).json(authResp.error.message);

    const { error } = await supabase.rpc("create_initial_data");
    if (error) return res.status(401).json(error.message);

    return res.status(201).end();
  } catch (error) {
    return res.status(500).json(error.message);
  }
}
