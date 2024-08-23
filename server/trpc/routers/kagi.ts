import { z } from "zod";

import type { KagiSummarizeResponse } from "~/types";

import { publicProcedure, router } from "../trpc";

export const kagiRouter = router({
  summarize: publicProcedure
    .input(
      z.object({
        type: z.enum(["summary"]).default("summary"),
        lang: z.enum(["ZH-HANT"]).default("ZH-HANT"),
        url: z.string().url(),
      }),
    )
    .query(({ ctx, input }) => {
      const client = kagiClient(ctx.event);
      return client
        .get("mother/summary_labs", {
          searchParams: {
            summary_type: input.type,
            target_language: input.lang,
            url: input.url,
          },
        })
        .json<KagiSummarizeResponse>();
    }),
});

export type KagiRouter = typeof kagiRouter;
