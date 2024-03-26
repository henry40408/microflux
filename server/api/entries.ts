import sanitizeHtml from "sanitize-html";

import { sendRequest } from "../miniflux";

interface MinifluxEntry {
  content: string;
}

interface MinifluxEntries {
  entries: MinifluxEntry[];
}

interface MinifluxUnreadCounters {
  reads: {
    [key: string]: number;
  };
  unreads: {
    [key: string]: number;
  };
}

export default defineEventHandler(async () => {
  try {
    const [data, counters] = await Promise.all([
      sendRequest<MinifluxEntries>({
        path: "/v1/entries",
        query: { status: "unread", direction: "asc" },
      }),
      sendRequest<MinifluxUnreadCounters>({
        path: "/v1/feeds/counters",
      }),
    ]);
    for (const entry of data.entries) {
      entry.content = sanitizeHtml(entry.content, {
        allowedTags: ["a", "br", "img", "p"],
        allowedAttributes: { a: ["href"], img: ["src"] },
      });
    }
    return {
      entries: data.entries,
      counters,
    };
  } catch (err) {
    console.error("failed to fetch entries from Miniflux", err);
    return {};
  }
});
