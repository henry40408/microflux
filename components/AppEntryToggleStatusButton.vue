<script setup lang="ts">
import type { MinifluxCompactEntry } from "~/server/trpc/routers/miniflux";

const model = defineModel<MinifluxCompactEntry>({ required: true });
const emit = defineEmits<{ toggleStatus: [status: string] }>();

const nextStatus = computed(() =>
  model.value.status === "unread" ? "read" : "unread",
);
const { $client } = useNuxtApp();
const fetched = await useAsyncData(
  `toggle-status-${model.value.id}`,
  () =>
    $client.miniflux.updateEntries.mutate({
      entryIds: [model.value.id],
      status: nextStatus.value,
    }),
  { immediate: false, server: false },
);

async function onClick() {
  const oldStatus = nextStatus.value;
  await fetched.execute();
  model.value.status = oldStatus;
  emit("toggleStatus", oldStatus);
}
</script>

<template>
  <BaseButton
    :error="fetched.error.value"
    :pending="fetched.status.value === 'pending'"
    @click="onClick"
    >{{ nextStatus === "read" ? "✅ read" : "✅ unread" }}</BaseButton
  >
</template>
