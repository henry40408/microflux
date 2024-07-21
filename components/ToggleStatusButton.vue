<script setup lang="ts">
import { secondsToMilliseconds } from "date-fns";

import type { MinifluxEntry } from "../types";

const model = defineModel<MinifluxEntry>({ required: true });

const nextStatus = computed(() =>
  model.value.status === "unread" ? "read" : "unread",
);
const body = computed(() => ({
  entryIds: [model.value.id],
  status: nextStatus.value,
}));
const { status, error, execute } = await useLazyFetch("/api/entries", {
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
}
</script>

<template>
  <MyButton :error="error" :loading="status === 'pending'" @click="onClick"
    >mark as {{ nextStatus }}</MyButton
  >
</template>
