import { tables } from "../../utils/drizzle";

export default defineEventHandler(async () => {
  const db = useDrizzle();
  const rows = db.select().from(tables.keywords).all();
  return rows;
});
