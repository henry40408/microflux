import type { H3Event } from "h3";
import { z } from "zod";

import { sendRequest } from "~/server/linkding";
import { parseBody } from "~/server/utils";

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
  const data = await parseBody(event, deleteSchema);
  switch (data.op) {
    case "delete":
      return deleteBookmark(event, data.id);
  }
});
