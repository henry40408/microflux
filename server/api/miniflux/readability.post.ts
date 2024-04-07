import { z } from "zod";
import { parseBody } from "~/server/utils";

const readabilitySchema = z.object({
  url: z.string(),
});

export default defineEventHandler(async (event) => {
  try {
    const data = await parseBody(event, readabilitySchema);
    const { content, length, textContent } = await fetchReadability(data.url);
    return { content, length, textContent };
  } catch (err) {
    console.error("failed to fetch readable content", err);
    throw createError({
      status: 400,
      statusMessage: "failed to fetch readable content",
    });
  }
});
