import type { H3Event } from "h3";

interface Options {
  path: string;
  query?: Record<string, string>;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
}

export async function sendRequest<T>(
  event: H3Event,
  options: Options,
): Promise<T> {
  const { minifluxUrl, minifluxToken } = useRuntimeConfig(event);
  options.headers = options.headers || {};
  options.headers["x-auth-token"] =
    options.headers["x-auth-token"] || minifluxToken;
  const url = new URL(`${minifluxUrl}${options.path}`);
  for (const [k, v] of Object.entries(options.query || {})) {
    url.searchParams.set(k, v);
  }
  const data = await $fetch(url.toString(), options);
  return data as T;
}
