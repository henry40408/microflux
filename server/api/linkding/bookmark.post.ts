import { z } from "zod";
import { fromZodError } from "zod-validation-error";

import { sendRequest } from "@/server/linkding";
import { H3RequestEvent } from "@/types";

const deleteSchema = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("delete"),
    id: z.number(),
  }),
]);

async function deleteBookmark(event: H3RequestEvent, id: number) {
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
