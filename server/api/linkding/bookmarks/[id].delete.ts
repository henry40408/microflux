import { sendRequest } from "~/server/linkding";

const logger = createLogger({ name: "linkding" });

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    await sendRequest(event, {
      path: `/api/bookmarks/${id}`,
      method: "DELETE",
    });
    return sendNoContent(event);
  } catch (err) {
    logger.error(err, "failed to delete bookmark");
    throw createError({
      status: 502,
      message: "failed to delete bookmark",
    });
  }
});
