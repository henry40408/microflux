import { z } from "zod";
import got from "got";

const getFullURLSchema = z.object({
  url: z.string().url(),
});

export default defineEventHandler(async (event) => {
  const result = await getValidatedQuery(event, (query) =>
    getFullURLSchema.safeParse(query),
  );
  if (!result.success) return result.error.issues;
  const query = result.data;

  // 1. try HEAD method
  try {
    const res = await got.head(query.url);
    if (res.url) return { url: res.url };
  } catch (err) {
    console.error(err);
  }

  // 2. try GET method
  try {
    const res = await got(query.url);
    if (res.url) return { url: res.url };
  } catch (err) {
    console.error(err);
  }

  // 3. otherwise, return the original URL
  return { url: query.url };
});
