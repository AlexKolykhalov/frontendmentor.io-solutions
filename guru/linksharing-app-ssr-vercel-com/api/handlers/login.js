import ejs  from "ejs";
import path from "path";

export default function (_, res) {
  ejs.renderFile(`${path.resolve()}/public/pages/login/login.ejs`, { filename: `${path.resolve()}/public/pages/login/login.ejs` }, (err, str) => {
    if (err) return res.status(500).json({ error: "EJS render error", text: err.message });
    res.send(str);
  });
}
