export function GET(req, res) {
  // return new Response(`Hello from ${process.env.VERCEL_REGION}`);
  res.status(200).sendFile("/public/html/login.html");
}
