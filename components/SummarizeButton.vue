<script setup lang="ts">
const model = defineModel<string>();
const props = defineProps<{ url: string }>();

const { data, status, error, execute } =
  await useLazyFetch<KagiSummarizeResponse>("/api/summarize", {
    method: "POST",
    body: { url: props.url },
    server: false,
    immediate: false,
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
