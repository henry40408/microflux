import { z } from "zod";

import { LinkdingBookmarkPaginationResponseSchema } from "~/schema/linkding";

import { publicProcedure, router } from "../trpc";

export const linkdingRouter = router({
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
      const json = await client
        .get("api/bookmarks/", {
          searchParams: { q: input.q?.toString() || "" },
        })
        .json();
      return LinkdingBookmarkPaginationResponseSchema.parse(json);
    }),
});

export type LinkdingRouter = typeof linkdingRouter;
