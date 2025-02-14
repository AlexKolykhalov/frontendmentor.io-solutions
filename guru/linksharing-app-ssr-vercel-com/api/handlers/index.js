import ejs                      from "ejs"
import path                     from "path";
import sql                      from "../../db.js";
import { getParams }            from "../../public/helpers.js";
import { getCookies,
	 verifySessionToken,
	 generateSessionToken } from "../../utils.js";

export default async function (req, res) {
  const result = verifySessionToken(getCookies(req)["session"]);
  if (!result) return res.redirect("/login");
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
  if (!user) return res.redirect("/login");
  user.links = user.links.map((item) => {
    return {
      id: item.id,
      number: user.links.indexOf(item) + 1,
      url: item.url,
      params: getParams(new URL(item.url).hostname)
    };
  });

  ejs.renderFile(
    `${path.resolve()}/public/pages/index/index.ejs`,
    { user: user },
    { views: [`${path.resolve()}/public/pages`] },
    (err, str) => {
      if (err) return res.status(500).json({ error: "EJS render error", text: err.message });
      const token = generateSessionToken({ id: result.id });
      res.setHeader("Set-Cookie", `session=${token}; HttpOnly; Secure; Path=/; Max-Age=1800`);
      res.send(str);
    }
  );
}
