interface KaigSummary {
  meta: {
    id: string;
    node: string;
    ms: number;
  };
  data: {
    output: string;
    tokens: number;
  };
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => ({}));
    if (!body.url) {
      throw createError({
        status: 400,
        message: "url is required",
      });
    }

    const { url }: { url: string } = body;
    const { kagiApiToken, kagiLanguage } = useRuntimeConfig();
    const resp: KaigSummary = await $fetch(
      "https://kagi.com/api/v0/summarize",
      {
        method: "POST",
        body: { url, target_language: kagiLanguage },
        headers: { authorization: `Bot ${kagiApiToken}` },
      },
    );

    const tokens = resp.data.tokens;
    console.log("%j", { action: "summarize", url, tokens });

    return {
      summary: resp.data.output,
      tokens,
    };
  } catch (err) {
    console.error("failed to summarize", err);
    throw createError({
      status: 502,
      message: "failed to summarize",
    });
  }
});
