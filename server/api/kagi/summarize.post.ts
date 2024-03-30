import pangu from "pangu";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

import type { KaigSummary } from "@/types";

const summarizeSchema = z.object({
  url: z.string(),
});

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) =>
    summarizeSchema.safeParse(body),
  );
  if (!result.success) {
    const validationError = fromZodError(result.error);
    throw createError({
      status: 400,
      statusMessage: validationError.toString(),
    });
  }

  try {
    const { url } = result.data;
    const { kagiToken, kagiLanguage } = useRuntimeConfig(event);
    const resp: KaigSummary = await $fetch(
      "https://kagi.com/api/v0/summarize",
      {
        method: "POST",
        body: { url, target_language: kagiLanguage },
        headers: { authorization: `Bot ${kagiToken}` },
      },
    );

    const tokens = resp.data.tokens;
    console.log("%j", { action: "summarize", url, tokens });

    return {
      summary: pangu.spacing(resp.data.output),
      tokens,
    };
  } catch (err) {
    console.error("failed to summarize", err);
    throw createError({
      status: 502,
      statusMessage: "failed to summarize",
    });
  }
});
