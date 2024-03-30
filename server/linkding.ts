import type { H3RequestEvent } from "~/types";

interface Options {
  path: string;
  query?: Record<string, string>;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
}

export async function sendRequest<T>(
  event: H3RequestEvent,
  options: Options,
): Promise<T> {
  const { linkdingUrl, linkdingToken } = useRuntimeConfig(event);
  options.headers = options.headers || {};
  options.headers["authorization"] =
    options.headers["authorization"] || `Token ${linkdingToken}`;
  const url = new URL(`${linkdingUrl}${options.path}`);
  for (const [k, v] of Object.entries(options.query || {})) {
    url.searchParams.set(k, v);
  }
  const data = await $fetch(url.toString(), options);
  return data as T;
}
