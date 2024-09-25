<template>
  <BaseButton
    once
    :clear="fetched.clear"
    :error="fetched.error"
    :status="fetched.status.value"
    @click="fetched.execute"
    >save</BaseButton
  >
</template>

<script setup lang="ts">
import type { MinifluxCompactEntry } from "~/server/trpc/routers/miniflux";

const model = defineModel<MinifluxCompactEntry>({ required: true });

const { $client } = useNuxtApp();

const fetched = useAsyncData(
  `entry:${model.value.id}:save`,
  () => $client.miniflux.saveEntry.mutate(model.value.id),
  { immediate: false, server: false },
);
</script>

<style scoped></style>
