export default async function (req, res) {
  res.setHeader("Set-Cookie", `session=; HttpOnly; Secure; Path=/; Max-Age=0`);
  res.status(200).end();
}
