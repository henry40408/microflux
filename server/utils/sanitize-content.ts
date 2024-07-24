import sanitizeHtml from "sanitize-html";

export default function (content: string): string {
  return sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
  });
}
