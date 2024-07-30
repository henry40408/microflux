import type { LinkdingBookmarkResponse } from "~/types";

export default defineEventHandler(async (event) => {
  const client = linkdingClient(event);
  const resp = await client
    .get("api/bookmarks/")
    .json<LinkdingBookmarkResponse>();
  return resp;
});
