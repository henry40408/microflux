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
