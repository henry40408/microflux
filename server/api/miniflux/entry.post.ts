import { createError } from "h3";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

import { H3RequestEvent } from "@/types";
import { sendRequest } from "@/server/miniflux";

const entrySchema = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("mark-as-read"),
    id: z.number(),
  }),
  z.object({
    op: z.literal("mark-many-as-read"),
    ids: z.number().array().min(1),
  }),
  z.object({
    op: z.literal("save"),
    id: z.number(),
  }),
]);

async function markAsRead(event: H3RequestEvent, ids: number[]) {
  try {
    await sendRequest(event, {
      path: "/v1/entries",
      method: "PUT",
      body: { entry_ids: ids, status: "read" },
    });
    return { ids };
  } catch (err) {
    console.error("failed to mark %j as read", ids, err);
    throw createError({
      status: 502,
      statusMessage: "failed to mark as read",
    });
  }
}

async function save(event: H3RequestEvent, id: number) {
  try {
    await sendRequest(event, {
      path: `/v1/entries/${id}/save`,
      method: "POST",
    });
    return { id };
  } catch (err) {
    console.error("failed to save %d", id);
    throw createError({
      status: 502,
      statusMessage: "failed to save",
    });
  }
}

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) =>
    entrySchema.safeParse(body),
  );
  if (!result.success) {
    const validationError = fromZodError(result.error);
    throw createError({
      status: 400,
      statusMessage: validationError.toString(),
    });
  }
  switch (result.data.op) {
    case "mark-as-read": {
      const { id } = result.data;
      return markAsRead(event, [id]);
    }
    case "mark-many-as-read": {
      const { ids } = result.data;
      return markAsRead(event, ids);
    }
    case "save":
      return save(event, result.data.id);
  }
});
