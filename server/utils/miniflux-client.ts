import { secondsToMilliseconds } from "date-fns";
import got from "got";
import type { Got } from "got";
import { H3Event } from "h3";

let client: Got | null = null;

export default function (event: H3Event): Got {
  const config = useRuntimeConfig(event);
  if (!config.minifluxUrl || !config.minifluxAuthToken)
    throw createError({ status: 503, message: "miniflux is not configured" });
  if (!client)
    client = got.extend({
      prefixUrl: config.minifluxUrl,
      headers: { "x-auth-token": config.minifluxAuthToken },
      timeout: { request: secondsToMilliseconds(60) },
    });
  return client;
}
