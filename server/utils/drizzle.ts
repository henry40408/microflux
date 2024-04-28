import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

import * as schema from "../database/schema";

export { sql, eq, and, or } from "drizzle-orm";

export const tables = schema;

export function useDrizzle() {
  const db = new Database(process.env.NUXT_DATABASE_URL);
  db.pragma("busy_timeout = 5000");
  db.pragma("journal_mode = wal");
  db.pragma("foreign_keys = OFF");
  db.pragma("synchronous = NORMAL");
  return drizzle(db, { schema });
}

export type Keyword = typeof schema.keywords.$inferSelect;
