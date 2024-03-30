import { sendRequest } from "@/server/linkding";

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}));
  switch (body.op) {
    case "delete": {
      if (!body.id) {
        throw createError({
          status: 400,
          statusMessage: "id is required",
        });
      }
      const { id } = body;
      await sendRequest({
        path: `/api/bookmarks/${id}`,
        method: "DELETE",
      });
      return { id };
    }
    default:
      throw createError({
        status: 400,
        statusMessage: `unexpected operation ${body.op}`,
      });
  }
});
