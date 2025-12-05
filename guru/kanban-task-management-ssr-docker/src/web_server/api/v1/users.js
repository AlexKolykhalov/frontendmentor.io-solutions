// @ts-check

/**
 * @param {any} req
 * @param {any} res
 * @returns {Promise<any>}
 */
export default async function (req, res) {
  if (req.method !== "POST") return res.status(405).json("Allow POST");

  if (!req.headers.authorization || req.headers.authorization.split(" ")[0] !== "Bearer")
    return res.status(401).end();

  const bearer = req.headers.authorization.split(" ")[1];

  const url     = `http://postgREST:4000/rpc/delete_user`;
  const options = {
    method: "POST",
    headers: {
      "Content-Profile": "auth",
      "Authorization":   `Bearer ${ bearer }`,
    }
  };

  try {
    const response = await fetch(url, options);

    if (response.status === 401) return res.status(401).end();
    if (response.status === 403) return res.status(403).end();
    if (response.status === 404) return res.status(404).end();

    return res.clearCookie("session-uuid").status(200).end();
  } catch (error) {
    return res.status(500).json(error.message);
  }
}
