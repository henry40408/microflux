import { z } from "zod";

import { KagiSummarizerOutputResponseSchema } from "~/schema/kagi";

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
    .query(async ({ ctx, input }) => {
      const client = kagiClient(ctx.event);
      const json = await client
        .get("mother/summary_labs", {
          searchParams: {
            summary_type: input.type,
            target_language: input.lang,
            url: input.url,
          },
        })
        .json();
      return KagiSummarizerOutputResponseSchema.parse(json);
    }),
});

export type KagiRouter = typeof kagiRouter;
