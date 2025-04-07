// @ts-check

import fs from "fs";
import path from "path";

import { serverClientServiceRole } from "../db/supabase/serverClient.js"

export default async function (req, res) {

  if (req.method === "POST") {
    const supabase = serverClientServiceRole(req, res);
    const { column_id, task } = req.body;    
    const { data, error } = await supabase.rpc("create_task", { column_id: column_id, task: task });
    if (error) return res.status(500).json(error);
    res.status(201).json(data);
  }

  if (req.method === "UPDATE") {
    res.status(200).json("board updated");
  }

  if (req.method === "DELETE") {
    res.status(200).json("board deleted");
  }

  // fs.readFile(`${path.resolve()}/public/data.json`, (err, data) => {
  //   if (err) res.status(500).json(`File reading error: ${err}`);
  //   try {
  //     const json = JSON.parse(data);

  //     let column;
  //     for (const board of json.boards) {
  // 	column = board.columns.find(column => column.id === req.body.column);
  // 	if (column) {
  // 	  const boardIndex  = json.boards.indexOf(board);
  // 	  const columnIndex = json.boards[boardIndex].columns.indexOf(column);
  // 	  json.boards[boardIndex].columns[columnIndex].tasks.push(req.body);

  // 	  break;
  // 	}
  //     }

  //     if (!column) res.status(400).json("can't find column");

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
}
