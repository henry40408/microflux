import { hoursToMilliseconds, minutesToMilliseconds } from "date-fns";
import type { H3Event } from "h3";
import lodash from "lodash";
import QuickLRU from "quick-lru";
import QuickLRU6 from "quick-lru6";
import { z } from "zod";

import type {
  LinkdingBookmark,
  LinkdingBookmarkPaginationResponse,
  LinkdingTagPaginationResponse,
} from "~/schema/linkding";

import { publicProcedure, router } from "../trpc";

const cache = new QuickLRU({ maxSize: 1000 });

const cache6 = new QuickLRU6({ maxSize: 1000 });
const ALL_BOOKMARKS_TTL = hoursToMilliseconds(1);
const ALL_BOOKMARKS_KEY = "linkding:bookmarks";
const VISITED_IDS_KEY = "linkding:visited-ids";
const VISITED_IDS_TTL = minutesToMilliseconds(5);

async function getAllBookmarks(event: H3Event) {
  const cached = cache6.get(ALL_BOOKMARKS_KEY) as
    | LinkdingBookmark[]
    | undefined;
  if (cached) return cached;

  const client = linkdingClient(event);
  const bookmarks = [];
  const limit = 500;
  let offset = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await client
      .get("api/bookmarks", { searchParams: { limit, offset } })
      .json<LinkdingBookmarkPaginationResponse>();
    if (res.results.length <= 0) break;
    for (const bookmark of res.results) {
      bookmarks.push(bookmark);
    }
    offset += limit;
  }
  cache6.set(ALL_BOOKMARKS_KEY, bookmarks, { maxAge: ALL_BOOKMARKS_TTL });
  return bookmarks;
}

export const linkdingRouter = router({
  addBookmark: publicProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const logger = getLogger();

      const { url } = input;
      const client = linkdingClient(ctx.event);
      const json = await client
        .post("api/bookmarks/", { json: { url } })
        .json();
      logger.info({ json }, "bookmark added");

      return null;
    }),
  deleteBookmark: publicProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const client = linkdingClient(ctx.event);
      await client.delete(`api/bookmarks/${input}/`);
      return null;
    }),
  getBookmarks: publicProcedure
    .input(z.object({ q: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const client = linkdingClient(ctx.event);
      return await client
        .get("api/bookmarks/", {
          cache,
          searchParams: { q: input.q?.toString() || "" },
        })
        .json<LinkdingBookmarkPaginationResponse>();
    }),
  getRandomBookmarks: publicProcedure
    .input(
      z.object({
        quantity: z.number().default(3),
        revisit: z.boolean().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      const bookmarks = await getAllBookmarks(ctx.event);
      if (input.revisit) cache6.delete(VISITED_IDS_KEY);
      const visitedIds = (cache6.get(VISITED_IDS_KEY) as number[]) || [];
      // clear visited IDs when all bookmarks are going to be excluded
      if (visitedIds.length >= bookmarks.length) visitedIds.length = 0;
      const rest = bookmarks.filter((b) => !visitedIds.includes(b.id));
      const picked = lodash.sampleSize(rest, input.quantity);
      cache6.set(
        VISITED_IDS_KEY,
        Array.from(new Set([...visitedIds, ...picked.map((b) => b.id)])),
        { maxAge: VISITED_IDS_TTL },
      );
      return picked;
    }),
  getTags: publicProcedure.query(async ({ ctx }) => {
    const client = linkdingClient(ctx.event);
    return await client
      .get("api/tags/", { cache })
      .json<LinkdingTagPaginationResponse>();
  }),
});

export type LinkdingRouter = typeof linkdingRouter;
