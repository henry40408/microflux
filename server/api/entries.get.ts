import { createError } from "h3";

import {
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
    const json = await client
      .get("v1/entries", {
        searchParams: { status: "unread", direction: "desc" },
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
