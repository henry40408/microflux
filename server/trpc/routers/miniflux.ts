import { z } from "zod";

import type { MinifluxEntry, MinifluxFetchContentResponse } from "~/types";

import { publicProcedure, router } from "../trpc";

export const minifluxRouter = router({
  getContent: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }): Promise<MinifluxFetchContentResponse> => {
      const client = minifluxClient(ctx.event);
      const entry = await client
        .get(`v1/entries/${input.id}`)
        .json<MinifluxEntry>();
      return {
        content: sanitizeContent(entry.content),
      };
    }),
});

// export type definition of API
export type MinifluxRouter = typeof minifluxRouter;
