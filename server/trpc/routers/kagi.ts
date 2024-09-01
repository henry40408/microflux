import PQueue from "p-queue";
import QuickLRU from "quick-lru";
import { z } from "zod";

import { KagiSummarizerOutputResponseSchema } from "~/schema/kagi";

import { publicProcedure, router } from "../trpc";
import { differenceInMilliseconds } from "date-fns";

const cache = new QuickLRU({ maxSize: 1000 });
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
      const start = new Date();
      const json = await queue.add(() => {
        logger.info({ message: "summarize", url });
        return client
          .get("mother/summary_labs", {
            searchParams: {
              summary_type: input.type,
              target_language: input.lang,
              url,
            },
            cache,
          })
          .json();
      });
      const elapsed = differenceInMilliseconds(new Date(), start);
      logger.info({ message: "summarized", url, elapsed });
      return KagiSummarizerOutputResponseSchema.parse(json);
    }),
});

export type KagiRouter = typeof kagiRouter;
