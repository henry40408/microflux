import type {
  MinifluxEntry,
  MinifluxFeed,
  MinifluxGetFeedEntriesResponse,
} from "~/types";
import minifluxClient from "../utils/miniflux-client";

export type MinifluxCompactFeed = Pick<
  MinifluxFeed,
  "id" | "title" | "category" | "icon"
>;

export type MinifluxCompactEntry = Omit<MinifluxEntry, "content" | "feed"> & {
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
        ...e,
        content: undefined,
        feed: {
          id: e.feed.id,
          title: e.feed.title,
          category: e.feed.category,
          icon: e.feed.icon,
        },
      })),
    };
  },
);
