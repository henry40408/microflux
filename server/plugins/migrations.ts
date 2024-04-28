import { consola } from "consola";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";

export default defineNitroPlugin(async () => {
  if (!import.meta.dev) return;

  const db = new Database(process.env.NUXT_DATABASE_URL);
  await migrate(drizzle(db), {
    migrationsFolder: "server/database/migrations",
  });
  consola.success("[dev] database migrated");
});
