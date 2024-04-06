import { useInterval } from "@vueuse/core";
import pangu from "pangu";

import type { LinkdingBookmark } from "@/types";

export function getLinkdingTitle(bookmark: LinkdingBookmark): string {
  return bookmark.title || bookmark.website_title;
}

export function getLinkdingDescription(bookmark: LinkdingBookmark): string {
  return bookmark.description || bookmark.website_description;
}

export const { format: formatNumber } = Intl.NumberFormat("en-US");

export function formatDate(date: Date) {
  const formatter = new Intl.DateTimeFormat(navigator.language, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
  return pangu.spacing(formatter.format(new Date(date)));
}

export function useReadability(url: string | Ref<string>) {
  const status = ref("idle");
  const data = ref(null);
  const execute = async () => {
    try {
      status.value = "pending";
      data.value = await $fetch("/api/miniflux/readability", {
        method: "POST",
        body: { url: toValue(url) },
        timeout: 30000,
      });
      status.value = "success";
    } catch (err) {
      console.error("failed to fetch readable content", err);
      status.value = "error";
    }
  };
  return { data, status, execute };
}

export function useSummarize(
  url: string | Ref<string>,
  readability: boolean | Ref<boolean>,
) {
  const status = ref("idle");
  const data = ref(null);
  const { counter, pause, reset } = useInterval(1000, { controls: true });
  const execute = async () => {
    try {
      reset();
      status.value = "pending";
      data.value = await $fetch("/api/kagi/summarize", {
        method: "POST",
        body: { url: toValue(url), readability: toValue(readability) },
        timeout: 30000,
      });
      status.value = "success";
      pause();
    } catch (err) {
      console.error("failed to summarize", err);
      status.value = "error";
    }
  };
  return { data, status, execute, seconds: counter };
}
