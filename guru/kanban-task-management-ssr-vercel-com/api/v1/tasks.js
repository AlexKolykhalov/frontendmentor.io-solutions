// @ts-check

import { serverClient } from "../functions.js";

/**
 * @param {any} req
 * @param {any} res
 * @returns {Promise<any>}
 */
export default async function (req, res) {
  const supabase = serverClient(req, res);
  const { error } = await supabase.auth.getUser();
  if (error) return res.status(401).end();

  try {
    if (req.method === "POST") {
      const { data, error } = await supabase.rpc("create_task", {
	p_task: req.body.task,
	p_column_id: req.body.columnID
      });
      if (error) {
	if (error.code === "PT403") return res.status(403).end();

	return res.status(500).end();
      }

      return res.status(201).json(data);
    }

    if (req.method === "GET" || req.method === "PUT" || req.method === "PATCH" || req.method === "DELETE") {
      const { id } = req.query;
      if (id) {
	let fn;
	let body;

	switch (req.method) {
	case ("GET"):
	  fn   = "get_task";
	  body = { p_task_id: id };
	  break;
	case ("PUT"):
	  fn = "update_task";
	  body = { p_task: req.body.task, p_column_id: req.body.columnID };
	  break;
	case ("PATCH"):
	  fn = "partly_update_task";
	  body = { p_task_id: id, p_column_id: req.body.columnID };
	  break;
	case ("DELETE"):
	  fn   = "delete_task";
	  body = { p_task_id: id };
	  break;
	}

	const { data, error } = await supabase.rpc(fn, body);
	if (error) {
	  if (error.code === "PT403") return res.status(403).end();
	  if (error.code === "PT404") return res.status(404).end();

	  return res.status(500).end();
	}
	
	if (req.method === "DELETE") return res.status(204).end();
	return res.status(200).json(data);
      }

      return res.status(404).end();
    }

    return res.status(405).json("Allow GET, POST, PUT, PATCH, DELETE");
  } catch (error) {
    return res.status(500).json(error.message);
  }
}
