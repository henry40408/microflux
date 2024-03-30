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

    const filter = query.filter?.toString() || "";
    const [type, id] = filter.split(":");

    let path = "";
    if (type === "category") {
      path = `/v1/categories/${id}/entries`;
    } else if (type === "feed") {
      path = `/v1/feeds/${id}/entries`;
    } else {
      path = "/v1/entries";
    }

    const [entries, counters] = await Promise.all([
      sendRequest<MinifluxEntries>({
        path,
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
        allowedAttributes: { a: ["href", "rel", "target"], img: ["src"] },
        transformTags: {
          a: (tagName, attribs) => ({
            tagName,
            attribs: { ...attribs, rel: "nofollow noopener", target: "_blank" },
          }),
        },
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
      statusMessage: "failed to fetch unread entries from Miniflux",
    });
  }
});
