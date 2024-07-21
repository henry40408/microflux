import got, { Got } from "got";
import { H3Event } from "h3";

let client: Got | null = null;

export default function (event: H3Event): Got {
  const config = useRuntimeConfig(event);
  if (!client)
    client = got.extend({
      prefixUrl: config.minifluxUrl,
      headers: { "x-auth-token": config.minifluxAuthToken },
    });
  return client;
}
