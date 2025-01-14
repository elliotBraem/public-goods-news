import type { Config } from "drizzle-kit";
import { join } from "path";

const DB_PATH =
  process.env.DATABASE_URL?.replace("file:", "") ||
  join(".db", "submissions.sqlite");

export default {
  schema: "./src/services/db/schema.ts",
  out: "./src/services/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: `file:${DB_PATH}`,
  },
} satisfies Config;
