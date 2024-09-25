import type { KagiSummarizerOutputResponse } from "~/schema/kagi";
import type { FullUrlResponse } from "~/schema/internal";

export class SummaryData {
  finalUrl!: string;
  summary!: string;
}

export default function useSummarize(url: string) {
  const { $client } = useNuxtApp();

  const summary = useAsyncData<KagiSummarizerOutputResponse>(
    `summarize-${url}`,
    () => $client.kagi.summarize.query({ url }),
    { immediate: false, server: false },
  );

  const fullUrl = useAsyncData<FullUrlResponse>(
    `full-url-${url}`,
    () => $client.getFullUrl.query({ url }),
    {
      immediate: false,
      server: false,
    },
  );

  return { summary, fullUrl };
}
