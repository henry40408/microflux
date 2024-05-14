import { useInterval, useLocalStorage } from "@vueuse/core";
import pangu from "pangu";

import {
  type CompactLinkdingBookmark,
  type ReadabilityResponse,
  type KagiSummarizeResponse,
  ReadabilityContent,
  OptionNames,
} from "@/types";

export function getLinkdingTitle(bookmark: CompactLinkdingBookmark): string {
  return bookmark.title || bookmark.website_title;
}

export function getLinkdingDescription(
  bookmark: CompactLinkdingBookmark,
): string {
  return bookmark.description || bookmark.website_description;
}

export function formatNumber(n: number | undefined): string {
  if (typeof n === "undefined") return "";
  const formatter = new Intl.NumberFormat("en-US");
  return formatter.format(n);
}

export function formatDate(date: string) {
  const formatter = new Intl.DateTimeFormat(navigator.language, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
  return pangu.spacing(formatter.format(new Date(date)));
}

export function useReadability(url: string | Ref<string>) {
  const status = ref("idle");
  const data = ref<ReadabilityResponse | undefined>(undefined);
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
  const data = ref<KagiSummarizeResponse | undefined>(undefined);
  const { counter, pause, reset } = useInterval(1000, { controls: true });
  const execute = async () => {
    try {
      reset();
      status.value = "pending";
      data.value = await $fetch<KagiSummarizeResponse>("/api/kagi/summarize", {
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

export function useOptions() {
  return {
    readabilityBeforeSummarization: useLocalStorage<boolean>(
      OptionNames.ReadabilityBeforeSummarization,
      false,
    ),
    readabilityContent: useLocalStorage<ReadabilityContent>(
      OptionNames.ReadabilityContent,
      ReadabilityContent.Content,
    ),
  };
}
