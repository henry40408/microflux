import { getQuery } from "h3";
import lodash from "lodash";
import pangu from "pangu";
import * as OpenCC from "opencc-js";

import { sendRequest } from "~/server/miniflux";
import type {
  MinifluxEntries,
  MinifluxUnreadCounters,
  CompactMinifluxEntry,
} from "~/types";

const logger = createLogger({ name: "miniflux" });
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
    logger.debug({ count }, "fetch unread entries");

    const pickedEntries: CompactMinifluxEntry[] = entries.entries.map(
      ({ content, feed, id, published_at, status, title, url }) => ({
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
        published_at,
        status,
        title,
        url,
      }),
    );

    const pickedCounters = lodash.pick(counters, ["unreads"]);
    logger.debug({ counters: pickedCounters }, "fetch unread counters");

    for (const entry of entries.entries) {
      entry.title = pangu.spacing(entry.title);
      const sanitized = sanitizeContent(entry.content);
      entry.content = convertToTChinese(sanitized);
    }

    return { entries: pickedEntries, counters: pickedCounters };
  } catch (err) {
    logger.error(err, "failed to fetch unread entries from Miniflux");
    throw createError({
      status: 502,
      statusMessage: "failed to fetch unread entries from Miniflux",
    });
  }
});
