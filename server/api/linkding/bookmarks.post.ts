import { z } from "zod";

import { sendRequest } from "~/server/linkding";

const logger = createLogger({ name: "linkding" });

const bodySchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  is_archived: z.boolean().optional(),
  unread: z.boolean().optional(),
  shared: z.boolean().optional(),
  tag_names: z.array(z.string()).optional(),
});

export default defineEventHandler(async (event) => {
  const data = await parseBody(event, bodySchema);
  const response = await sendRequest(event, {
    path: `/api/bookmarks/`,
    method: "POST",
    body: data,
  });
  logger.info(response, "create bookmark");
  return data;
});
