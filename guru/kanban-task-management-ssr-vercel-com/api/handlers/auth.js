// @ts-check

import fs        from "fs";
import path      from "path";
import { JSDOM } from "jsdom";

import { ColorSchemeToggle } from "../../public/pages/_shared/components/color_scheme_toggle.js";
import { AuthForm }          from "../../public/pages/auth/components/auth_form.js";

export default async function (req, res) {
  fs.readFile(`${path.resolve()}/public/pages/auth/auth.html`, "utf-8", async (err, text) => {
    if (err) return res.status(500).json({ error: "File reading error", text: err.message });
    try {
      // initialization of global variables
      globalThis.paths = {};

      const dom = new JSDOM(text);

      const authForm          = dom.window.document.querySelector("auth-form");
      const colorSchemeToggle = dom.window.document.querySelector("color-scheme-toggle");

      if (!authForm)          throw new Error("<auth-form> is missing");
      if (!colorSchemeToggle) throw new Error("<color-scheme-toggle> is missing");

      authForm.outerHTML          = AuthForm.template();
      colorSchemeToggle.outerHTML = ColorSchemeToggle.template();
      
      dom.window.document.body.dataset.paths = JSON.stringify(globalThis.paths);

      res.send(dom.serialize());
    } catch (error) {
      return res.status(500).json({
	error: "HTML validation error",
	text: error.message,
	stack: error.stack
      });
    }
  });
}
