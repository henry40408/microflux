import pangu from "pangu";

import type { KaigSummary } from "@/types";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}));
    if (!body.url) {
      throw createError({
        status: 400,
        statusMessage: "url is required",
      });
    }

    const { url }: { url: string } = body;
    const { kagiToken, kagiLanguage } = useRuntimeConfig();
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
