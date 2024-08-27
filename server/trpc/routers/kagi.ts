import PQueue from "p-queue";
import { z } from "zod";

import { KagiSummarizerOutputResponseSchema } from "~/schema/kagi";

import { publicProcedure, router } from "../trpc";

const queue = new PQueue({ concurrency: 3 });

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
      const url = input.url;
      const logger = getLogger();

      const client = kagiClient(ctx.event);
      const json = await queue.add(() => {
        logger.info({ message: "summarize", url });
        return client
          .get("mother/summary_labs", {
            searchParams: {
              summary_type: input.type,
              target_language: input.lang,
              url,
            },
          })
          .json();
      });
      logger.info({ message: "summarized", url });
      return KagiSummarizerOutputResponseSchema.parse(json);
    }),
});

export type KagiRouter = typeof kagiRouter;
