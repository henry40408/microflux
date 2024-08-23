import { z } from "zod";

import type { LinkdingBookmarkResponse } from "~/types";

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
    .query(({ ctx, input }) => {
      const client = linkdingClient(ctx.event);
      return client
        .get("api/bookmarks/", {
          searchParams: { q: input.q?.toString() || "" },
        })
        .json<LinkdingBookmarkResponse>();
    }),
});

export type LinkdingRouter = typeof linkdingRouter;
