import { secondsToMilliseconds } from "date-fns";
import got from "got";
import type { Got } from "got";
import type { H3Event } from "h3";

let client: Got | null = null;

export default function (event: H3Event): Got {
  const config = useRuntimeConfig(event);
  if (!config.linkdingUrl || !config.linkdingToken)
    throw createError({ status: 503, message: "linkding is not configured" });

  if (!client)
    client = got.extend({
      prefixUrl: config.linkdingUrl,
      headers: { authorization: `Token ${config.linkdingToken}` },
      timeout: { request: secondsToMilliseconds(60) },
    });
  return client;
}
