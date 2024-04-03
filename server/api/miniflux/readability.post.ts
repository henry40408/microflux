import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
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
    const html = await $fetch<string>(result.data.url, {
      headers: { "user-agent": "Microflux/1.0" },
    });
    const sanitized = sanitizeContent(html);
    const dom = new JSDOM(sanitized);
    const document = dom.window.document;

    const reader = new Readability(document);
    const readable = reader.parse();
    if (!readable)
      throw createError({
        status: 400,
        statusMessage: "web page is not readable",
      });

    const { length, content } = readable;
    return { length, content };
  } catch (err) {
    console.error("failed to fetch readable content", err);
    throw createError({
      status: 400,
      statusMessage: "failed to fetch readable content",
    });
  }
});
