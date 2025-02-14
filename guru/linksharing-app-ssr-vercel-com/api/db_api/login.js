import { scrypt, timingSafeEqual } from "crypto";
import { promisify }               from "util";
import sql                         from "../../db.js";
import { generateSessionToken }    from "../../utils.js";

export default async function (req, res) {  
  const { email, password } = req.body;
  const [auth] = await sql`select user_id, password from "Authentications" where email = ${email}`;
  if (!auth) return res.status(401).send({ message: "Email and Password don't match." });
  const isEqual = await verify(auth.password, password);
  if (!isEqual) return res.status(401).send({ message: "Email and Password don't match." });
  const token = generateSessionToken({ id: auth.user_id });
  res.setHeader(
    "Set-Cookie", `session=${token}; HttpOnly; SameSite=Lax; Secure; Path=/; Max-Age=1800`
  );

  res.status(200).json("success");
}

async function verify(hash, password) {
  const [salt, key]   = hash.split(":");
  const keyBuffer     = Buffer.from(key, "hex");
  const scryptPromise = promisify(scrypt);
  const deriveKey     = await scryptPromise(password, salt, 64);

  return timingSafeEqual(keyBuffer, deriveKey);
}
