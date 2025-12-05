// @ts-check

/**
 * @param {any} req
 * @param {any} res
 * @returns {Promise<any>}
 */
export default async function (req, res) {
  if (req.method !== "POST") return res.status(405).json("Allow POST");

  try {
    const { email, password } = req.body || {};

    const url     = "http://postgREST:4000/rpc/signin";
    const options = {
      method: "POST",
      headers: {
	"Content-Type":    "application/json",
	"Content-Profile": "auth",
      },
      body: JSON.stringify({
	p_login:    email    ?? process.env.DEFAULT_USER_LOGIN,
	p_password: password ?? process.env.DEFAULT_USER_PASSWORD
      })
    };

    const response = await fetch(url, options);
    const data     = await response.json();
    if (response.status === 401) return res.status(401).json(data.message);
    if (response.status !== 200) return res.status(500).end();

    res.cookie(
      "session-uuid", data.session,
      {
	maxAge: 1000 * 60 * 15, // 15 min
	httpOnly: true,
	secure: true,
	sameStrict: "Strict"
      }
    )

    return res.status(200).json(data.bearer);
  } catch (error) {
    console.log(`error: ${error}`)
    return res.status(500).json(error.message);
  }
}
