import type { H3Event } from "h3";

import { createError } from "h3";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

import { sendRequest } from "~/server/miniflux";
import type { MinifluxEntryStatus } from "~/types";

const entrySchema = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("toggle-read"),
    id: z.number(),
    status: z.enum(["read", "unread"]),
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

async function toggleRead(
  event: H3Event,
  ids: number[],
  status: MinifluxEntryStatus,
) {
  try {
    await sendRequest(event, {
      path: "/v1/entries",
      method: "PUT",
      body: { entry_ids: ids, status },
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

async function save(event: H3Event, id: number) {
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
    case "toggle-read": {
      const { id, status } = result.data;
      return toggleRead(event, [id], status);
    }
    case "mark-many-as-read": {
      const { ids } = result.data;
      return toggleRead(event, ids, "read");
    }
    case "save":
      return save(event, result.data.id);
  }
});
