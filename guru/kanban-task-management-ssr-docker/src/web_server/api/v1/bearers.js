// @ts-check

/**
 * @param {any} req
 * @param {any} res
 * @returns {Promise<any>}
 */
export default async function (req, res) {
  if (req.method !== "POST") return res.status(405).json("Allow POST");
  if (!req.headers.cookie)   return res.status(401).end();

  const cookiesArray = req.headers.cookie.split('; ').reduce((acc, item) => {
    const [name, value] = item.split('=')
    acc[name] = value
    return acc
  }, {});

  try {
    const urlToken    = "http://postgREST:4000/rpc/generate_authz_token";
    const optionToken = {
      method: "POST",
      headers: {
	"Content-Type":    "application/json",
	"Content-Profile": "auth",
	"Cookie":          `session-uuid=${cookiesArray["session-uuid"]}`
      }
    };

    const response = await fetch(urlToken, optionToken);
    if (response.status === 401) return res.status(401).end();
    if (response.status !== 200) return res.status(500).end();

    res.cookie( // update cookie maxAge
      "session-uuid", cookiesArray["session-uuid"],
      {
	maxAge: 1000 * 60 * 15, // 15 min
	httpOnly: true,
	secure: true,
	sameStrict: "Strict"
      }
    )

    return res.status(201).json(await response.json());
  } catch (error) {
    return res.status(500).json(error.message);
  }
}
