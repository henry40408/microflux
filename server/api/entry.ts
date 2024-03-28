import { readBody, createError } from "h3";

import { sendRequest } from "../miniflux";

async function markAsRead(ids: number[]) {
  try {
    await sendRequest({
      path: "/v1/entries",
      method: "PUT",
      body: { entry_ids: ids, status: "read" },
    });
    return { ids };
  } catch (err) {
    console.error("failed to mark %j as read", ids, err);
    throw createError({
      status: 502,
      message: "failed to mark as read",
    });
  }
}

async function save(id: number) {
  try {
    await sendRequest({
      path: `/v1/entries/${id}/save`,
      method: "POST",
    });
    return { id };
  } catch (err) {
    console.error("failed to save %d", id);
    throw createError({
      status: 502,
      message: "failed to save",
    });
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}));
  switch (body.op) {
    case "mark-as-read": {
      if (!body.id && !body.ids) {
        throw createError({
          status: 400,
          message: "id or ids is required",
        });
      }
      const ids = body.ids ? body.ids : [body.id];
      return markAsRead(ids);
    }
    case "save":
      if (!body.id) {
        throw createError({ status: 400, message: "id is required" });
      }
      return save(body.id);
    default:
      throw createError({
        status: 400,
        message: `unexpected operation ${body.op}`,
      });
  }
});
