<template>
  <BaseButton
    :error="fetched.error"
    :status="fetched.status.value"
    @click="onClick"
    >{{ nextStatus }}</BaseButton
  >
</template>

<script setup lang="ts">
import type { MinifluxCompactEntry } from "~/server/trpc/routers/miniflux";

const model = defineModel<MinifluxCompactEntry>({ required: true });
const nextStatus = computed(() =>
  model.value.status === "unread" ? "read" : "unread",
);

const emit = defineEmits<{ click: [status: string] }>();

const { $client } = useNuxtApp();
const fetched = useAsyncData(
  `entry:${model.value.id}:status`,
  () =>
    $client.miniflux.updateEntries.mutate({
      status: nextStatus.value,
      entryIds: [model.value.id],
    }),
  { immediate: false, server: false },
);

async function onClick() {
  const newStatus = nextStatus.value;
  await fetched.execute();
  model.value.status = newStatus;
  emit("click", newStatus);
}
</script>

<style scoped></style>
