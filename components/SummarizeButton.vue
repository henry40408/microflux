<script setup lang="ts">
import { secondsToMilliseconds } from "date-fns";

const model = defineModel<string>();
const props = defineProps<{ url: string }>();

const { data, status, error, execute } =
  await useLazyFetch<KagiSummarizeResponse>("/api/summarize", {
    method: "POST",
    body: { url: props.url },
    immediate: false,
    server: false,
    timeout: secondsToMilliseconds(30),
    watch: false,
  });

async function onClick() {
  await execute();
  model.value = data.value.output_data.markdown;
}
</script>

<template>
  <MyButton
    :done="status === 'success'"
    :error="error"
    :loading="status === 'pending'"
    @click="onClick"
    >summarize</MyButton
  >
</template>
