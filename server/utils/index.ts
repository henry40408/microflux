import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import sanitizeHtml from "sanitize-html";

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
