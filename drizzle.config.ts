import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    url: process.env.NUXT_DATABASE_URL || "development.sqlite3",
  },
  driver: "better-sqlite",
  out: "./server/database/migrations",
  schema: "./server/database/schema.ts",
});
