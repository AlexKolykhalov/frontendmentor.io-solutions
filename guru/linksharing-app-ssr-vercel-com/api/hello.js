export default function handler(req, res) {
  // return new Response(`Hello from ${process.env.VERCEL_REGION}`);
  res.status(200).json({ text: "/public/html/login.html" });
}
