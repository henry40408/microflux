import { sendRequest } from "~/server/linkding";

interface Bookmark {}

interface Bookmarks {
  results: Bookmark[];
}

export default defineEventHandler(async () => {
  try {
    const data: Bookmarks = await sendRequest({
      path: "/api/bookmarks/",
    });
    return {
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
