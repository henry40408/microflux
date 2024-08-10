import lodash from "lodash";

import type { MinifluxFeed } from "~/types";

import type { MinifluxCompactFeed } from "./entries.get";

export default defineEventHandler(
  async (event): Promise<MinifluxCompactFeed[]> => {
    const client = minifluxClient(event);
    const feeds = await client.get("v1/feeds").json<MinifluxFeed[]>();
    return feeds.map((feed) => ({
      ...lodash.pick(feed, ["icon", "id", "title"]),
      category: lodash.pick(feed.category, ["id", "title"]),
    }));
  },
);
