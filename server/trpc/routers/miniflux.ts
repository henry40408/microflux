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
  "feed_url" | "icon" | "id" | "site_url" | "title"
> & {
  category: MinifluxCompactCategory;
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

const cache = new QuickLRU({ maxSize: 1000 });

export const minifluxRouter = router({
  createFeed: publicProcedure
    .input(z.object({ url: z.string(), categoryId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const client = minifluxClient(ctx.event);
      return await client
        .post("v1/feeds", {
          json: { feed_url: input.url, category_id: input.categoryId },
        })
        .json<{ feed_id: number }>();
    }),
  deleteFeed: publicProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const client = minifluxClient(ctx.event);
      await client.delete(`v1/feeds/${input}`);
      return null;
    }),
  getCategories: publicProcedure.query(async ({ ctx }) => {
    const client = minifluxClient(ctx.event);
    return await client
      .get("v1/categories", { cache })
      .json<MinifluxCategory[]>();
  }),
  getContent: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }): Promise<MinifluxFetchContent> => {
      const client = minifluxClient(ctx.event);
      const entry = await client
        .get(`v1/entries/${input}`, { cache })
        .json<MinifluxEntry>();
      return { content: sanitizeContent(entry.content) };
    }),
  getCounters: publicProcedure.query(async ({ ctx }) => {
    const client = minifluxClient(ctx.event);
    return await client.get(`v1/feeds/counters`, { cache }).json<{
      reads: Record<string, number>;
      unreads: Record<string, number>;
    }>();
  }),
  getFullContent: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const client = minifluxClient(ctx.event);
      const { content } = await client
        .get(`v1/entries/${input}/fetch-content`, { cache })
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
            cache,
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
              feed_url: e.feed.feed_url,
              icon: e.feed.icon,
              id: e.feed.id,
              site_url: e.feed.site_url,
              title: e.feed.title,
              category:
                e.feed.category &&
                lodash.pick(e.feed.category, ["id", "title"]),
            },
          })),
        };
      },
    ),
  getFeeds: publicProcedure.query(async ({ ctx }) => {
    const client = minifluxClient(ctx.event);
    return await client.get("v1/feeds", { cache }).json<MinifluxFeed[]>();
  }),
  getIcon: publicProcedure.input(z.number()).query(async ({ ctx, input }) => {
    const client = minifluxClient(ctx.event);

    return await client
      .get(`v1/icons/${input}`, { cache })
      .json<MinifluxIcon>();
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
  updateFeed: publicProcedure
    .input(
      z.object({
        id: z.number(),
        categoryId: z.number().optional(),
        feedUrl: z.string().optional(),
        title: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const client = minifluxClient(ctx.event);
      return await client
        .put(`v1/feeds/${input.id}`, {
          json: {
            category_id: input.categoryId,
            feed_url: input.feedUrl,
            title: input.title,
          },
        })
        .json<MinifluxFeed>();
    }),
});

export type MinifluxRouter = typeof minifluxRouter;
