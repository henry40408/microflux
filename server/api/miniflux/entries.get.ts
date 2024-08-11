import lodash from "lodash";
import type {
  MinifluxCategory,
  MinifluxEntry,
  MinifluxFeed,
  MinifluxGetFeedEntriesResponse,
} from "~/types";
import minifluxClient from "~/server/utils/miniflux-client";

export type MinifluxCompactCategory = Pick<MinifluxCategory, "id" | "title">;

export type MinifluxCompactFeed = Pick<
  MinifluxFeed,
  "id" | "title" | "icon"
> & {
  category: MinifluxCompactCategory;
};

export type MinifluxCompactEntry = Pick<
  MinifluxEntry,
  "id" | "published_at" | "status" | "title" | "url"
> & {
  feed: MinifluxCompactFeed;
};

export interface MinifluxGetFeedCompactEntriesResponse {
  total: number;
  entries: MinifluxCompactEntry[];
}

export default defineEventHandler(
  async (event): Promise<MinifluxGetFeedCompactEntriesResponse> => {
    const client = minifluxClient(event);
    const { categoryId, feedId } = getQuery(event);

    let path = "v1/entries";
    if (feedId) {
      path = `v1/feeds/${feedId}/entries`;
    } else if (categoryId) {
      path = `v1/categories/${categoryId}/entries`;
    }

    const json = await client
      .get(path, {
        searchParams: { status: "unread", direction: "asc" },
      })
      .json<MinifluxGetFeedEntriesResponse>();
    return {
      total: json.total,
      entries: json.entries.map((e) => ({
        ...lodash.pick(e, ["id", "published_at", "status", "title", "url"]),
        feed: {
          id: e.feed.id,
          title: e.feed.title,
          category: lodash.pick(e.feed.category, ["id", "title"]),
          icon: e.feed.icon,
        },
      })),
    };
  },
);
