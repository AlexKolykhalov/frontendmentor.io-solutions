import { randomBytes, scrypt, randomUUID } from "crypto";
import { promisify } from "util";

import sql                      from "../../db.js";
import { generateSessionToken } from "../../utils.js";


export default async function (req, res) {
  const { email, password } = req.body;
  const [auth] = await sql`select * from "Authentications" where email = ${email}`;
  if (auth)
    return res.status(409).send({
      message: "Registration could not be completed. If you have an account, please log in."
    });
  const hash = await getHash(password);
  const uuid = randomUUID();
  await sql.begin(async (sql) => {
    await sql`insert into "Users" ( email, name, avatar, user_id )
              values ( ${email}, 'Jonh Doe', '', ${uuid} )`;
    await sql`insert into "Authentications" ( email, password, user_id )
              values ( ${email}, ${hash}, ${uuid} )`
  });
  const token = generateSessionToken({ id: uuid });
  res.setHeader("Set-Cookie", [
    `session=${token}; HttpOnly; Secure; Path=/; Max-Age=1800`
  ]);

  res.status(201).json("success");
}

async function getHash(password) {
  const salt          = randomBytes(16).toString("hex");
  const scryptPromise = promisify(scrypt);
  const derivedKey    = await scryptPromise(password, salt, 64);
  
  return `${salt}:${derivedKey.toString("hex")}`;
}
