// @ts-check

import ejs from "ejs";
import path from "path";
import { readFileSync } from "fs";

/**
 * @param {string} pathToFile
 */
export function getCompileEJS(pathToFile) {  
  return ejs.compile(
    readFileSync(path.resolve() + pathToFile, "utf-8"),
    { filename: path.resolve() + pathToFile }
  );
}
