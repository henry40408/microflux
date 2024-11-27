<template>
  <BaseConfirm :status="fetched.status.value" @confirm="confirm">
    mark {{ entryIds.length }} as read
  </BaseConfirm>
</template>

<script setup lang="ts">
import { type MinifluxCompactEntry } from "~/server/trpc/routers/miniflux";

const model = defineModel<MinifluxCompactEntry[]>({ required: true });

const props = defineProps<{
  entryIds: number[];
}>();

const { $client } = useNuxtApp();
const fetched = useAsyncData(
  "mark-all-as-read",
  () =>
    $client.miniflux.updateEntries.mutate({
      entryIds: props.entryIds,
      status: "read",
    }),
  { immediate: false, server: false },
);

async function confirm() {
  await fetched.execute();
  for (const entry of model.value) {
    entry.status = "read";
  }
}
</script>

<style scoped></style>
