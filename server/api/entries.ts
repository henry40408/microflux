import { getQuery } from "h3";
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

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const feedId = query.feed_id;
    const [entries, counters] = await Promise.all([
      sendRequest<MinifluxEntries>({
        path: feedId ? `/v1/feeds/${feedId}/entries` : "/v1/entries",
        query: { status: "unread", direction: "asc" },
      }),
      sendRequest<MinifluxUnreadCounters>({
        path: "/v1/feeds/counters",
      }),
    ]);
    console.debug("%j", {
      action: "fetch_unread_entries",
      count: entries.entries.length,
    });
    console.debug("%j", { action: "fetch_unread_counters", counters });

    for (const entry of entries.entries) {
      entry.content = sanitizeHtml(entry.content, {
        allowedTags: ["a", "br", "img", "li", "ol", "p", "ul"],
        allowedAttributes: { a: ["href"], img: ["src"] },
      });
    }
    return {
      entries: entries.entries,
      counters,
    };
  } catch (err) {
    console.error("failed to fetch unread entries from Miniflux", err);
    throw createError({
      status: 502,
      message: "failed to fetch unread entries from Miniflux",
    });
  }
});
