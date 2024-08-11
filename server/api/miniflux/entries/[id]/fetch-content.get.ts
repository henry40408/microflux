import type { MinifluxFetchContentResponse } from "~/types";

export default defineEventHandler(async (event) => {
  const client = minifluxClient(event);
  const id = getRouterParam(event, "id");
  const json = await client
    .get(`v1/entries/${id}/fetch-content`)
    .json<MinifluxFetchContentResponse>();
  return { content: sanitizeContent(json.content) };
});
