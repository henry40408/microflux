import { sendRequest } from "~/server/linkding";
import type { LinkdingBookmarks } from "~/types";

export default defineEventHandler(async (event) => {
  try {
    const data: LinkdingBookmarks = await sendRequest(event, {
      path: "/api/bookmarks/",
    });
    return {
      count: data.count,
      bookmarks: data.results.map(
        ({
          date_added,
          description,
          id,
          title,
          url,
          website_description,
          website_title,
        }) => ({
          date_added,
          description,
          id,
          title,
          url,
          website_description,
          website_title,
        }),
      ),
    };
  } catch (err) {
    console.error("failed to fetch bookmarks", err);
    throw createError({
      status: 502,
      statusMessage: "failed to fetch bookmarks from Linkding",
    });
  }
});
