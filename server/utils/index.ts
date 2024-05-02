import type { H3Event } from "h3";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import sanitizeHtml from "sanitize-html";
import type z from "zod";
import { fromZodError } from "zod-validation-error";
import createPinoLogger from "pino";
import type { LoggerOptions } from "pino";

const HEADINGS = ["h1", "h2", "h3", "h4", "h5", "h6"];
const ALLOWED_TAGS = HEADINGS.concat([
  "a",
  "b",
  "blockquote",
  "code",
  "br",
  "em",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "strong",
  "u",
  "ul",
]);
const ALLOWED_ATTRIBS = { a: ["href", "rel", "target"], img: ["src"] };

export async function fetchReadability(url: string) {
  const html = await $fetch<string>(url, {
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

  const { content, length, textContent } = readable;
  return { content, length, textContent };
}

export function sanitizeContent(content: string): string {
  return sanitizeHtml(content, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBS,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: "nofollow noopener",
          target: "_blank",
        },
      }),
    },
  });
}

export async function parseBody<T extends z.ZodTypeAny>(
  event: H3Event,
  schema: T,
) {
  const result = await readValidatedBody(event, (body) =>
    schema.safeParse(body),
  );
  if (!result.success) {
    const validationError = fromZodError(result.error);
    throw createError({
      status: 400,
      statusMessage: validationError.toString(),
    });
  }
  return result.data as z.infer<T>;
}

export function createLogger(opts: LoggerOptions) {
  opts = { ...opts, level: process.env.LOG_LEVEL || "info" };
  return createPinoLogger(opts);
}
