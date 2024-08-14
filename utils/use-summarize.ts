import { secondsToMilliseconds } from "date-fns";
import type { FullURLResponse, KagiSummarizeResponse } from "~/types";

export class SummaryData {
  finalUrl!: string;
  summary!: string;
}

export default function useSummarize(url: string) {
  const data = ref<SummaryData | null>(null);

  const sf = useLazyFetch<KagiSummarizeResponse>("/api/kagi/summarize", {
    key: `summarize-${url}`,
    method: "POST",
    body: { url },
    immediate: false,
    server: false,
    timeout: secondsToMilliseconds(30),
    watch: false,
  });

  const ff = useLazyFetch<FullURLResponse>("/api/full-url", {
    key: `full-url-${url}`,
    method: "POST",
    body: { url },
    immediate: false,
    server: false,
    timeout: secondsToMilliseconds(30),
    watch: false,
  });

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
