import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const keywords = sqliteTable("keywords", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  keyword: text("keyword").notNull(),
  feedId: integer("feed_id"),
  categoryId: integer("category_id"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
