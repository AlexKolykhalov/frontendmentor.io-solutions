import ejs                      from "ejs"
import path                     from "path";
import sql                      from "../db.js";
import { getParams }            from "../../public/helpers.js";

export default async function (req, res) {  
  const { id } = req.query;  
  if (!id) return res.status(404).json("Not found");
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
    where "Users".user_id = ${id}
    group by "Users".name, "Users".email, "Users".avatar`;
  if (!user) return res.status(404).json("Not found");  
  user.links = user.links.map((item) => {
    return {
      id: item.id,
      number: user.links.indexOf(item) + 1,
      url: item.url,
      params: getParams(new URL(item.url).hostname)
    };
  });

  ejs.renderFile(`${path.resolve()}/public/pages/profile/profile.ejs`, { user: user }, (err, str) => {
    if (err) return res.status(500).json({ error: "EJS render error", text: err.message });    
    res.send(str);
  });
}
