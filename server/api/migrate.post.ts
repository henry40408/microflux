import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

export default defineEventHandler(async () => {
  const db = drizzle(new Database(process.env.NUXT_DATABASE_URL));
  migrate(db, { migrationsFolder: "server/database/migrations" });
  console.log("%j", { tag: "migrate", action: "migrate", status: "success" });
  return {};
});
