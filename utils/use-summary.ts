import type { KagiSummarizerOutputResponse } from "~/schema/kagi";
import type { FullUrlResponse } from "~/schema/internal";

export class SummaryData {
  finalUrl!: string;
  summary!: string;
}

export default function (url: string) {
  const { $client } = useNuxtApp();
  return useAsyncData<[KagiSummarizerOutputResponse, FullUrlResponse]>(
    `summarize-full-url:${url}`,
    async () => [
      await $client.kagi.summarize.query({ url }),
      await $client.getFullUrl.query({ url }),
    ],
    { immediate: false, server: false },
  );
}
