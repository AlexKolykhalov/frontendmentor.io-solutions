// @ts-check

import { serverClient, serverClientServiceRole } from "../functions.js";

/**
 * @param {any} req
 * @param {any} res
 * @returns {Promise<any>}
 */
export default async function (req, res) {
  if (req.method !== "POST") return res.status(405).json("Allow POST");

  try {
    const supabase      = serverClient(req, res);
    const supabaseAdmin = serverClientServiceRole(req, res);

    const resultGetUser = await supabase.auth.getUser();
    if (resultGetUser.error) return res.status(401).end();

    const { error } = await supabase.rpc("delete_user_data", { p_user_id: resultGetUser.data.user.user_metadata.sub });
    if (error) {
      if (error.code === "PT403") return res.status(403).end();

      return res.status(500).end();
    }
    
    const resultSignOut = await supabase.auth.signOut();
    if (resultSignOut.error) return res.status(401).end();

    // delete user from supabase sql table
    const resultUserDelete = await supabaseAdmin.auth.admin.deleteUser(resultGetUser.data.user.user_metadata.sub);
    if (resultUserDelete.error) return res.status(500).json("User hasn't been deleted");

    return res.status(200).end();
  } catch (error) {
    return res.status(500).json(error.message);
  }
}
