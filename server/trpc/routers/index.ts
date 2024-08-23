import { router } from "../trpc";
import { minifluxRouter } from "./miniflux";

export const appRouter = router({
  miniflux: minifluxRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
