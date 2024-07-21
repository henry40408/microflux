import { z } from "zod";

import type { KagiSummarizeResponse } from "~/types";

const querySchema = z.object({
  type: z.enum(["summary"]).default("summary"),
  lang: z.enum(["ZH-HANT"]).default("ZH-HANT"),
  url: z.string().url(),
});

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) =>
    querySchema.safeParse(body),
  );

  if (!result.success) throw result.error.issues;

  const query = result.data;
  const client = kagiClient(event);
  return client
    .get("mother/summary_labs", {
      searchParams: {
        summary_type: query.type,
        target_language: query.lang,
        url: query.url,
      },
    })
    .json<KagiSummarizeResponse>();
});
