import sql                      from "../db.js";
import { getCookies,
	 verifySessionToken,
	 generateSessionToken } from "../utils.js";

export default async function (req, res) {
  // TODO check body
  if (!req.body) return res.status(400).json({ message: "Bad request" });
  const result = verifySessionToken(getCookies(req)["session"]);
  if (!result) return res.status(401).json("Unauthorized");
  if (!req.body.name.split(" ")[0])
    return res.status(400).json({ message: "First name is required" });
  if (!req.body.name.split(" ")[1])
    return res.status(400).json({ message: "Last name is required" });

  const [user] = await sql.begin(async (sql) => {
    await sql`
      update "Users"
      set ${sql(req.body, 'avatar', 'name', 'email')}
      where user_id = ${result.id}
      returning avatar, name, email`;
    for (const item of req.body.links) {
      if (!item.url) {
	const [deleted] = await sql`
          delete
          from "Links"
          where link_id=${item.id} and user_id=${result.id}
          returning id, link_id, url`;
	console.log(`deleted: ${JSON.stringify(deleted, null, 2)}`);
	continue;
      }
      const [link] = await sql`select * from "Links" where link_id=${item.id} and user_id=${result.id}`;
      if (link) {
	const [updated] = await sql`
          update "Links"
          set url=${item.url}
          where link_id=${item.id} and user_id=${result.id}
          returning id, link_id, url`;
	console.log(`updated: ${JSON.stringify(updated, null, 2)}`);
      } else {
	const [created] = await sql`
          insert into "Links" (url, link_id, user_id)
          values (${item.url}, ${item.id}, ${result.id})
          returning id, link_id, url`;
	console.log(`created: ${JSON.stringify(created, null, 2)}`);
      }
    }
    const [user] = await sql`
    select
      "Users".name,
      "Users".email,
      "Users".avatar,
      coalesce(
        json_agg(
          json_build_object('id', "Links".link_id, 'url', "Links".url) order by "Links".id
        ) filter (where "Links".link_id is not null and "Links".url is not null),
        '[]'::json) as links
    from "Users"
    left join "Links" on "Users".user_id = "Links".user_id
    where "Users".user_id = ${result.id}
    group by "Users".name, "Users".email, "Users".avatar`;
    
    return [user];
  });

  res.setHeader("Set-Cookie",
    `session=${ generateSessionToken({ id: result.id }) }; HttpOnly; Secure; Path=/; Max-Age=1800`
  );
  res.status(200).json(user);
}
