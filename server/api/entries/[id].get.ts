import { MinifluxEntry } from "~/types";

export default defineEventHandler(async (event): Promise<MinifluxEntry> => {
  const id = getRouterParam(event, "id");
  const client = minifluxClient(event);
  return client.get(`v1/entries/${id}`).json();
});
