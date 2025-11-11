// @ts-check

import { serverClient } from "../functions.js";

/**
 * @param {any} req
 * @param {any} res
 * @returns {Promise<any>}
 */
export default async function (req, res) {
  if (req.method !== "PATCH") return res.status(405).json("Allow PATCH");
  
  const { id } = req.query;
  if (!id) return res.status(404).end();
  
  const supabase = serverClient(req, res);
  const { error } = await supabase.auth.getUser();
  if (error) return res.status(401).end();

  try {
    const { data, error } = await supabase.rpc("update_subtask", {
      p_subtask: { id: id, isCompleted: req.body.isCompleted }
    });
    if (error) {
      if (error.code === "PT403") return res.status(403).end();
      if (error.code === "PT404") return res.status(404).end();

      return res.status(500).end();
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json(error.message);
  }
}
