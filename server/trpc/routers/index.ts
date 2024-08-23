import { z } from "zod";
import got from "got";

import { publicProcedure, router } from "../trpc";
import { kagiRouter } from "./kagi";
import { minifluxRouter } from "./miniflux";
import { linkdingRouter } from "./linkding";

export const appRouter = router({
  linkding: linkdingRouter,
  kagi: kagiRouter,
  miniflux: minifluxRouter,
  getFullUrl: publicProcedure
    .input(z.object({ url: z.string().url() }))
    .query(async ({ input }) => {
      const logger = getLogger();

      // 1. try HEAD method
      try {
        const res = await got.head(input.url);
        if (res.url) return { url: res.url };
      } catch (err) {
        logger.error(err);
      }

      // 2. try GET method
      try {
        const res = await got(input.url);
        if (res.url) return { url: res.url };
      } catch (err) {
        logger.error(err);
      }

      // 3. otherwise, return the original URL
      return { url: input.url };
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
