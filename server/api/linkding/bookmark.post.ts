import type { H3Event } from "h3";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

import { sendRequest } from "~/server/linkding";

const deleteSchema = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("delete"),
    id: z.number(),
  }),
]);

async function deleteBookmark(event: H3Event, id: number) {
  await sendRequest(event, {
    path: `/api/bookmarks/${id}`,
    method: "DELETE",
  });
  return { id };
}

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) =>
    deleteSchema.safeParse(body),
  );
  if (!result.success) {
    const validationError = fromZodError(result.error);
    throw createError({
      status: 400,
      statusMessage: validationError.toString(),
    });
  }

  switch (result.data.op) {
    case "delete":
      return deleteBookmark(event, result.data.id);
  }
});
