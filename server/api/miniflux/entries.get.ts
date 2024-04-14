import { getQuery } from "h3";
import lodash from "lodash";
import pangu from "pangu";
import * as OpenCC from "opencc-js";

import { sendRequest } from "~/server/miniflux";
import type {
  MinifluxEntries,
  MinifluxUnreadCounters,
  PartialMinifluxEntry,
} from "~/types";

const convertToTChinese = OpenCC.Converter({ from: "cn", to: "tw" });

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
      sendRequest<MinifluxEntries>(event, {
        path,
        query: { status: "unread", direction: "asc" },
      }),
      sendRequest<MinifluxUnreadCounters>(event, {
        path: "/v1/feeds/counters",
      }),
    ]);

    const count = entries.entries.length;
    console.debug("%j", {
      tag: "entries",
      action: "fetch_unread_entries",
      count,
    });

    const pickedEntries: PartialMinifluxEntry[] = entries.entries.map(
      ({ content, feed, id, status, title, url }) => ({
        content,
        feed: {
          category: {
            id: feed.category.id,
            title: feed.category.title,
          },
          id: feed.id,
          title: feed.title,
        },
        id,
        status,
        title,
        url,
      }),
    );

    const pickedCounters = lodash.pick(counters, ["unreads"]);
    console.debug("%j", {
      tag: "entries",
      action: "fetch_unread_counters",
      counters: pickedCounters,
    });

    for (const entry of entries.entries) {
      entry.title = pangu.spacing(entry.title);
      const sanitized = sanitizeContent(entry.content);
      entry.content = convertToTChinese(sanitized);
    }

    return { entries: pickedEntries, counters: pickedCounters };
  } catch (err) {
    console.error("failed to fetch unread entries from Miniflux", err);
    throw createError({
      status: 502,
      statusMessage: "failed to fetch unread entries from Miniflux",
    });
  }
});
