<script setup lang="ts">
import { secondsToMilliseconds } from "date-fns";

import type { KagiSummarizeResponse } from "../types";

const model = defineModel<string>();
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

async function onClick() {
  await execute();
  if (data.value) model.value = data.value.output_data.markdown;
}

function onCancel() {
  clear();
  model.value = "";
}
</script>

<template>
  <MyButton
    :cancel="onCancel"
    :done="status === 'success'"
    :error="error"
    :loading="status === 'pending'"
    @click="onClick"
    >summarize<template #done>reset summary</template></MyButton
  >
</template>
