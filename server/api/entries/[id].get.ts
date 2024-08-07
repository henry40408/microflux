import type { MinifluxEntry } from "~/types";

export default defineEventHandler(async (event): Promise<MinifluxEntry> => {
  const id = getRouterParam(event, "id");
  const client = minifluxClient(event);
  const json = await client.get(`v1/entries/${id}`).json<MinifluxEntry>();
  return {
    ...json,
    content: sanitizeContent(json.content),
  };
});
