import { getCookies, verifySessionToken, generateSessionToken } from "../../utils.js";

export default async function (req, res) {
  const result = verifySessionToken(getCookies(req)["session"]);
  if (!result) return res.redirect("/login");
  const token = generateSessionToken({ id: result.id });
  res.setHeader("Set-Cookie", `session=${token}; HttpOnly; Secure; Path=/; Max-Age=1800`);
  res.send(
    process.env.NODE_ENV ?
      `https://linksharing-appssr.vercel.app/${result.id}` :
      `http://localhost:3000/${result.id}`
  );
}
