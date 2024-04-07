import * as OpenCC from "opencc-js";
import pangu from "pangu";
import { z } from "zod";

import { fetchReadability, parseBody } from "~/server/utils";
import type { KagiSummary, KagiSummaryRequest } from "~/types";

const convert = OpenCC.Converter({ from: "cn", to: "tw" });

const summarizeSchema = z.object({
  url: z.string(),
  readability: z.boolean().optional().default(false),
});

export default defineEventHandler(async (event) => {
  const data = await parseBody(event, summarizeSchema);
  try {
    const { url, readability } = data;
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
