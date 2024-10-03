import { z } from "zod";

import type {
  LinkdingBookmarkPaginationResponse,
  LinkdingTagPaginationResponse,
} from "~/schema/linkding";

import { publicProcedure, router } from "../trpc";

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
          searchParams: { q: input.q?.toString() || "" },
        })
        .json<LinkdingBookmarkPaginationResponse>();
    }),
  getTags: publicProcedure.query(async ({ ctx }) => {
    const client = linkdingClient(ctx.event);
    return await client.get("api/tags/").json<LinkdingTagPaginationResponse>();
  }),
});

export type LinkdingRouter = typeof linkdingRouter;
