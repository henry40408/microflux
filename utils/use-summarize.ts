import type { KagiSummarizerOutputResponse } from "~/schema/kagi";
import type { FullUrlResponse } from "~/schema/internal";

export class SummaryData {
  finalUrl!: string;
  summary!: string;
}

export default function useSummarize(url: string) {
  const { $client } = useNuxtApp();

  const data = ref<SummaryData | null>(null);

  const sf = useAsyncData<KagiSummarizerOutputResponse>(
    `summarize-${url}`,
    () => $client.kagi.summarize.query({ url }),
    { immediate: false, server: false },
  );

  const ff = useAsyncData<FullUrlResponse>(
    `full-url-${url}`,
    () => $client.getFullUrl.query({ url }),
    {
      immediate: false,
      server: false,
    },
  );

  watch([sf.data, ff.data], ([s, u]) => {
    if (s && u) {
      data.value = {
        summary: s.output_data.markdown,
        finalUrl: u.url,
      };
    }
  });

  const error = computed(() => sf.error.value || ff.error.value);
  const done = computed(
    () => sf.status.value === "success" && ff.status.value === "success",
  );
  const pending = computed(
    () => sf.status.value === "pending" || ff.status.value === "pending",
  );

  async function execute() {
    await Promise.all([sf.execute(), ff.execute()]);
  }

  function clear() {
    sf.clear();
    ff.clear();
  }

  return {
    clear,
    data,
    done,
    error,
    execute,
    pending,
  };
}
