import { sendRequest } from "@/server/linkding";

import type { LinkdingBookmarks } from "@/types";

export default defineEventHandler(async (event) => {
  try {
    const data: LinkdingBookmarks = await sendRequest(event, {
      path: "/api/bookmarks/",
    });
    return {
      count: data.count,
      bookmarks: data.results,
    };
  } catch (err) {
    console.error("failed to fetch bookmarks", err);
    throw createError({
      status: 502,
      statusMessage: "failed to fetch bookmarks from Linkding",
    });
  }
});
