import { secondsToMilliseconds } from "date-fns";
import got, { Got } from "got";
import { H3Event } from "h3";

let client: Got | null = null;

export default function (event: H3Event): Got {
  const config = useRuntimeConfig(event);
  if (!config.kagiSessionLink)
    throw createError({ status: 503, message: "kagi is not configured" });

  const token = config.kagiSessionLink.replace(
    "https://kagi.com/search?token=",
    "",
  );
  if (!client)
    client = got.extend({
      prefixUrl: "https://kagi.com",
      headers: { authorization: token },
      timeout: { request: secondsToMilliseconds(30) },
    });
  return client;
}
