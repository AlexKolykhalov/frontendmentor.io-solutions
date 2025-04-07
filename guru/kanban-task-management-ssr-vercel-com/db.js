import postgres from "postgres";

export default postgres(`postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:6543/postgres`);
