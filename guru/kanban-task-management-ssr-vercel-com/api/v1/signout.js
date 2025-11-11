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

    const { data: { user }} = await supabase.auth.getUser();
    if (!user) return res.status(401).end();

    const { error } = await supabase.auth.signOut();
    if (error) return res.status(401).end();

    if (user.is_anonymous) {
      // delete user from supabase sql table
      const resultUserDelete = await supabaseAdmin.auth.admin.deleteUser(user.id);
      if (resultUserDelete.error) return res.status(500).json("User hasn't been deleted");
    }

    return res.status(204).end();
  } catch (error) {
    return res.status(500).json(error.message);
  }
}
