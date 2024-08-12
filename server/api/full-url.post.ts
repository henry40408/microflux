import { z } from "zod";
import got from "got";

import type { FullURLResponse } from "~/types";

const getFullURLSchema = z.object({
  url: z.string().url(),
});

export default defineEventHandler(async (event): Promise<FullURLResponse> => {
  const logger = getLogger();

  const result = await readValidatedBody(event, (body) =>
    getFullURLSchema.safeParse(body),
  );
  if (!result.success) throw result.error.issues;
  const query = result.data;

  // 1. try HEAD method
  try {
    const res = await got.head(query.url);
    if (res.url) return { url: res.url };
  } catch (err) {
    logger.error(err);
  }

  // 2. try GET method
  try {
    const res = await got(query.url);
    if (res.url) return { url: res.url };
  } catch (err) {
    logger.error(err);
  }

  // 3. otherwise, return the original URL
  return { url: query.url };
});
