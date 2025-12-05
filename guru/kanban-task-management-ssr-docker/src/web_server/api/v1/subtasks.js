// @ts-check

/**
 * @param {any} req
 * @param {any} res
 * @returns {Promise<any>}
 */
export default async function (req, res) {  
  if (!req.headers.authorization || req.headers.authorization.split(" ")[0] !== "Bearer")
    return res.status(401).end();

  const bearer = req.headers.authorization.split(" ")[1];

  if (req.method === "PATCH") {

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!req.params.uuid || !uuidRegex.test(req.params.uuid))
      return res.status(404).end();

    let fn;
    let body;

    switch (req.method) {
    case ("PATCH"):
      fn   = "update_subtask";
      body = { p_subtask: { id: req.params.uuid, isCompleted: req.body.isCompleted } };
      break;
    }

    const url     = `http://postgREST:4000/rpc/${fn}`;
    const options = {
      method: "POST",
      headers: {
	"Content-Type":    "application/json",
	"Content-Profile": "api",
	"Authorization":   `Bearer ${ bearer }`,
      },
      body: JSON.stringify(body)
    };

    try {
      const response = await fetch(url, options);
      
      if (response.status === 401) return res.status(401).end();
      if (response.status === 403) return res.status(403).end();
      if (response.status === 404) return res.status(404).end();
      
      return res.status(200).json(await response.json());      
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }
  
  return res.status(405).json("Allow PATCH");
}
