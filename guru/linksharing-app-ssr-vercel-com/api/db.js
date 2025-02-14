import postgres from "postgres";

const connectionString = `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:6543/postgres`;

const sql = postgres(connectionString);

export default sql;

