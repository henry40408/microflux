import { z } from "zod";
import { parseBody } from "~/server/utils";

const logger = createLogger({ name: "readability" });

const readabilitySchema = z.object({
  url: z.string(),
});

export default defineEventHandler(async (event) => {
  try {
    const data = await parseBody(event, readabilitySchema);
    logger.info(data, "readability");
    const { content, length, textContent } = await fetchReadability(data.url);
    return { content, length, textContent };
  } catch (err) {
    logger.error(err, "failed to fetch readable content");
    throw createError({
      status: 502,
      statusMessage: "failed to fetch readable content",
    });
  }
});
