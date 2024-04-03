import { Readability, isProbablyReaderable } from "@mozilla/readability";
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
    const dom = new JSDOM(html);
    const document = dom.window.document;

    if (!isProbablyReaderable(document))
      throw createError({
        status: 400,
        statusMessage: "web page is not readable",
      });

    const reader = new Readability(document);
    const readable = reader.parse();
    if (!readable)
      throw createError({
        status: 400,
        statusMessage: "web page is not readable",
      });

    const { title, textContent } = readable;
    return { title, textContent };
  } catch (err) {
    console.error("failed to fetch readable content", err);
    throw createError({
      status: 400,
      statusMessage: "failed to fetch readable content",
    });
  }
});
