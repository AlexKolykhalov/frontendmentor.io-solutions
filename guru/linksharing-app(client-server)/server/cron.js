import express from "express";
import { cronValidator } from "./src/validators/cron.validator";
const app = express();

app.get("/", cronValidator, (_, res) => res.status(200).json("Express on Vercel"));
app.listen(3000, () => console.log("Server ready on port 3000."));

// export function GET(request) {
//     return new Response("Hello");
// }

