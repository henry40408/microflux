import type { LinkdingBookmarkResponse } from "~/types";

export default defineEventHandler(async (event) => {
  const { q } = getQuery(event);
  const client = linkdingClient(event);
  const resp = await client
    .get("api/bookmarks/", { searchParams: { q: q?.toString() || "" } })
    .json<LinkdingBookmarkResponse>();
  return resp;
});
