import * as OpenCC from "opencc-js";
import pangu from "pangu";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { fetchReadability } from "~/server/utils";

import type { KagiSummary, KagiSummaryRequest } from "~/types";

const convert = OpenCC.Converter({ from: "cn", to: "tw" });

const summarizeSchema = z.object({
  url: z.string(),
  readability: z.boolean().optional().default(false),
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
    const { url, readability } = result.data;
    const { kagiToken, kagiLanguage } = useRuntimeConfig(event);

    const body: KagiSummaryRequest = { target_language: kagiLanguage };
    if (readability) {
      const readable = await fetchReadability(url);
      body.text = readable.textContent;
    } else {
      body.url = url;
    }

    const resp: KagiSummary = await $fetch(
      "https://kagi.com/api/v0/summarize",
      {
        method: "POST",
        body,
        headers: { authorization: `Bot ${kagiToken}` },
      },
    );

    const tokens = resp.data.tokens;
    console.log("%j", { action: "summarize", url, tokens });

    return {
      summary: pangu.spacing(convert(resp.data.output)),
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
