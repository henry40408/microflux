import sanitizeHtml from "sanitize-html";

import { sendRequest } from "../miniflux";

interface MinifluxEntry {
  content: string;
}

interface MinifluxEntries {
  entries: MinifluxEntry[];
}

export default defineEventHandler(async () => {
  try {
    const data: MinifluxEntries = await sendRequest<MinifluxEntries>({
      path: "/v1/entries",
      query: { status: "unread", direction: "asc" },
    });
    for (const entry of data.entries) {
      entry.content = sanitizeHtml(entry.content, {
        allowedTags: [],
        allowedAttributes: {},
      });
    }
    return data;
  } catch (err) {
    console.error("failed to fetch entries from Miniflux", err);
    return {};
  }
});
