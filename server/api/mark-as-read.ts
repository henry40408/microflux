import { readBody, createError } from "h3";

import { sendRequest } from "../miniflux";

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}));

  if (!body.id && !body.ids) {
    throw createError({
      status: 400,
      message: "id or ids is required",
    });
  }

  const ids = body.ids ? body.ids : [body.id];
  try {
    await sendRequest({
      path: "/v1/entries",
      method: "PUT",
      body: { entry_ids: ids, status: "read" },
    });
    return { ids };
  } catch (err) {
    console.error("failed to mark %j as read", ids, err);
  }
});
