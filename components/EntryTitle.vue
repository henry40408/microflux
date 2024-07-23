<script setup lang="ts">
import { secondsToMilliseconds } from "date-fns";

import type { MinifluxCompactEntry } from "../server/api/entries.get";

const model = defineModel<MinifluxCompactEntry>({ required: true });
const isRead = computed(() => model.value.status === "read");

const body = computed(() => ({ entryIds: [model.value.id], status: "read" }));
const { status, error, execute } = await useLazyFetch("/api/entries", {
  method: "PUT",
  body,
  immediate: false,
  server: false,
  timeout: secondsToMilliseconds(30),
  watch: false,
});

async function onClick() {
  await execute();
  model.value.status = "read";
}
</script>

<template>
  <div class="space-y-2 md:flex md:items-end md:space-y-0">
    <a
      class="block text-xl"
      :class="{ 'text-slate-300': isRead, 'dark:text-slate-600': isRead }"
      :href="modelValue.url"
      target="_blank"
      @click="onClick"
      >{{ pangu(modelValue.title) }}</a
    >
    <div class="text-sm md:ml-2">#{{ modelValue.id }}</div>
  </div>
</template>
