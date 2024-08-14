<script setup lang="ts">
import { secondsToMilliseconds } from "date-fns";

import type { MinifluxCompactEntry } from "../server/api/miniflux/entries.get";

const model = defineModel<MinifluxCompactEntry>({ required: true });
const emit = defineEmits<{ "toggle-status": [status: string] }>();

const nextStatus = computed(() =>
  model.value.status === "unread" ? "read" : "unread",
);
const body = computed(() => ({
  entryIds: [model.value.id],
  status: nextStatus.value,
}));
const fetchEntries = await useLazyFetch("/api/miniflux/entries", {
  key: `toggle-status-${model.value.id}`,
  method: "PUT",
  body,
  immediate: false,
  server: false,
  timeout: secondsToMilliseconds(30),
  watch: false,
});

async function onClick() {
  const oldStatus = nextStatus.value;
  await fetchEntries.execute();
  model.value.status = oldStatus;
  emit("toggle-status", oldStatus);
}
</script>

<template>
  <MyButton
    :error="fetchEntries.error.value"
    :pending="fetchEntries.status.value === 'pending'"
    @click="onClick"
    >{{ nextStatus }}</MyButton
  >
</template>
