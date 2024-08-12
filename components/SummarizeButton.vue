<script setup lang="ts">
import { secondsToMilliseconds } from "date-fns";

import type { KagiSummarizeResponse, FullURLResponse } from "~/types";

const model = defineModel<string>("summary", { required: true });
const finalUrl = defineModel<string>("finalUrl", { required: true });
const props = defineProps<{ url: string }>();

const { data, status, error, execute, clear } =
  await useLazyFetch<KagiSummarizeResponse>("/api/kagi/summarize", {
    key: `summarize-${props.url}`,
    method: "POST",
    body: { url: props.url },
    immediate: false,
    server: false,
    timeout: secondsToMilliseconds(30),
    watch: false,
  });

const {
  data: fullUrlData,
  status: fullUrlStatus,
  error: fullUrlError,
  execute: executeFullUrl,
  clear: clearFullUrl,
} = await useLazyFetch<FullURLResponse>("/api/full-url", {
  key: `full-url-${props.url}`,
  method: "POST",
  body: { url: props.url },
  immediate: false,
  server: false,
  timeout: secondsToMilliseconds(30),
  watch: false,
});

const isPending = computed(
  () => status.value === "pending" || fullUrlStatus.value === "pending",
);
const isSuccess = computed(
  () => status.value === "success" && fullUrlStatus.value === "success",
);

async function onClick() {
  await Promise.all([execute(), executeFullUrl()]);
  if (data.value) model.value = data.value.output_data.markdown;
  if (fullUrlData.value) finalUrl.value = fullUrlData.value.url;
}

function onCancel() {
  clear();
  clearFullUrl();
  model.value = "";
  finalUrl.value = "";
}
</script>

<template>
  <MyButton
    :cancel="onCancel"
    :done="isSuccess"
    :error="error || fullUrlError"
    :loading="isPending"
    @click="onClick"
    >summarize<template #done>reset summary</template></MyButton
  >
</template>
