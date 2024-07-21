import { z } from "zod";

const putEntriesSchema = z.object({
  entryIds: z.number().array(),
  status: z.enum(["read", "unread"]),
});

export default defineEventHandler(async (event) => {
  const client = minifluxClient(event);
  const result = await readValidatedBody(event, (body) =>
    putEntriesSchema.safeParse(body),
  );
  if (!result.success) throw result.error.issues;
  const body = result.data;
  await client.put("v1/entries", {
    body: JSON.stringify({
      entry_ids: body.entryIds,
      status: body.status,
    }),
  });
  return null;
});
