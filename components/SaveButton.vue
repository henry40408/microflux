<script setup lang="ts">
import type { MinifluxCompactEntry } from "~/server/trpc/routers/miniflux";

const model = defineModel<MinifluxCompactEntry>({ required: true });

const { $client } = useNuxtApp();
const fetched = await useAsyncData(
  `save-${model.value.id}`,
  () => $client.miniflux.saveEntry.mutate(model.value.id),
  { immediate: false, server: false },
);
</script>

<template>
  <MyButton
    :done="fetched.status.value === 'success'"
    :error="fetched.error.value"
    :pending="fetched.status.value === 'pending'"
    @click="fetched.execute"
    >save</MyButton
  >
</template>
