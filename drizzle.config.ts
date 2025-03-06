import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./migrations",
  driver: "pg",
  dialect: "postgresql",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
    ssl: process.env.NODE_ENV === 'production'
  },
  verbose: true,
  strict: true,
});