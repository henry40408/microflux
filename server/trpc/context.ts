import type { H3Event } from "h3";
import type { inferAsyncReturnType } from "@trpc/server";

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = (event: H3Event) => ({ event });

export type Context = inferAsyncReturnType<typeof createContext>;
