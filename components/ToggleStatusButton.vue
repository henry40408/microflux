<script setup lang="ts">
import { secondsToMilliseconds } from "date-fns";

import type { MinifluxCompactEntry } from "../server/api/entries.get";

const model = defineModel<MinifluxCompactEntry>({ required: true });
const emit = defineEmits<{ "toggle-status": [status: string] }>();

const nextStatus = computed(() =>
  model.value.status === "unread" ? "read" : "unread",
);
const body = computed(() => ({
  entryIds: [model.value.id],
  status: nextStatus.value,
}));
const { status, error, execute } = await useLazyFetch("/api/entries", {
  key: `toggle-status-${model.value.id}`,
  method: "PUT",
  body,
  immediate: false,
  server: false,
  timeout: secondsToMilliseconds(30),
  watch: false,
});

async function onClick() {
  const s = nextStatus.value;
  await execute();
  model.value.status = s;
  emit("toggle-status", s);
}
</script>

<template>
  <MyButton :error="error" :loading="status === 'pending'" @click="onClick">{{
    nextStatus
  }}</MyButton>
</template>
