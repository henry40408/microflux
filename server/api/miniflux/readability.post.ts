import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const readabilitySchema = z.object({
  url: z.string(),
});

export default defineEventHandler(async (event) => {
  try {
    const result = await readValidatedBody(event, (body) =>
      readabilitySchema.safeParse(body),
    );
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw createError({
        status: 400,
        statusMessage: validationError.toString(),
      });
    }
    const { content, length, textContent } = await fetchReadability(
      result.data.url,
    );
    return { content, length, textContent };
  } catch (err) {
    console.error("failed to fetch readable content", err);
    throw createError({
      status: 400,
      statusMessage: "failed to fetch readable content",
    });
  }
});
