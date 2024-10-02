import lodash from "lodash";
import QuickLRU from "quick-lru";
import { z } from "zod";

import type {
  MinifluxCategory,
  MinifluxEntry,
  MinifluxEntryResultSet,
  MinifluxFeed,
  MinifluxFetchContent,
  MinifluxIcon,
} from "~/schema/miniflux";

import { publicProcedure, router } from "../trpc";

export type MinifluxCompactCategory = Pick<MinifluxCategory, "id" | "title">;

export type MinifluxCompactFeed = Pick<
  MinifluxFeed,
  "icon" | "id" | "title"
> & {
  category?: MinifluxCompactCategory;
};

export type MinifluxCompactEntry = Pick<
  MinifluxEntry,
  "comments_url" | "id" | "published_at" | "status" | "title" | "url"
> & {
  feed: MinifluxCompactFeed;
};

export interface MinifluxGetFeedCompactEntriesResponse {
  total: number;
  entries: MinifluxCompactEntry[];
}

const iconCache = new QuickLRU<number, MinifluxIcon>({ maxSize: 1000 });

export const minifluxRouter = router({
  getContent: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }): Promise<MinifluxFetchContent> => {
      const client = minifluxClient(ctx.event);
      const entry = await client
        .get(`v1/entries/${input}`)
        .json<MinifluxEntry>();
      return { content: sanitizeContent(entry.content) };
    }),
  getFullContent: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const client = minifluxClient(ctx.event);
      const { content } = await client
        .get(`v1/entries/${input}/fetch-content`)
        .json<MinifluxFetchContent>();
      return { content: sanitizeContent(content) };
    }),
  getEntries: publicProcedure
    .input(
      z.object({
        categoryId: z.string().optional(),
        feedId: z.string().optional(),
      }),
    )
    .query(
      async ({
        ctx,
        input,
      }): Promise<MinifluxGetFeedCompactEntriesResponse> => {
        const client = minifluxClient(ctx.event);

        let path = "v1/entries";
        if (input.feedId) {
          path = `v1/feeds/${input.feedId}/entries`;
        } else if (input.categoryId) {
          path = `v1/categories/${input.categoryId}/entries`;
        }

        const { total, entries } = await client
          .get(path, {
            searchParams: { direction: "asc", status: "unread" },
          })
          .json<MinifluxEntryResultSet>();
        return {
          total,
          entries: entries.map((e) => ({
            ...lodash.pick(e, [
              "comments_url",
              "id",
              "published_at",
              "status",
              "title",
              "url",
            ]),
            feed: {
              icon: e.feed.icon,
              id: e.feed.id,
              title: e.feed.title,
              category:
                e.feed.category &&
                lodash.pick(e.feed.category, ["id", "title"]),
            },
          })),
        };
      },
    ),
  getIcon: publicProcedure.input(z.number()).query(async ({ ctx, input }) => {
    const client = minifluxClient(ctx.event);

    const cached = iconCache.get(input);
    if (cached) return cached;

    const fetched = await client.get(`v1/icons/${input}`).json<MinifluxIcon>();
    iconCache.set(input, fetched);

    return fetched;
  }),
  saveEntry: publicProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const client = minifluxClient(ctx.event);
      await client.post(`v1/entries/${input}/save`);
      return null;
    }),
  updateEntries: publicProcedure
    .input(
      z.object({
        entryIds: z.number().array(),
        status: z.enum(["read", "unread"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const client = minifluxClient(ctx.event);
      await client.put("v1/entries", {
        body: JSON.stringify({
          entry_ids: input.entryIds,
          status: input.status,
        }),
      });
      return null;
    }),
});

export type MinifluxRouter = typeof minifluxRouter;
