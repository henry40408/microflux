<script setup lang="ts">
import { secondsToMilliseconds } from "date-fns";

import type { MinifluxCompactEntry } from "../server/api/miniflux/entries.get";

const model = defineModel<MinifluxCompactEntry>({ required: true });
const isRead = computed(() => model.value.status === "read");

const body = computed(() => ({ entryIds: [model.value.id], status: "read" }));
const fetched = await useLazyFetch("/api/miniflux/entries", {
  key: `mark-as-read-${model.value.id}`,
  method: "PUT",
  body,
  immediate: false,
  server: false,
  timeout: secondsToMilliseconds(30),
  watch: false,
});

async function onClick() {
  await fetched.execute();
  model.value.status = "read";
}
</script>

<template>
  <div>
    <h3 space-x-2>
      <a
        :class="{ 'text-slate-500': isRead }"
        :href="modelValue.url"
        rel="noreferrer noopener"
        target="_blank"
        @click="onClick"
        >{{ pangu(modelValue.title) }}</a
      >
      <small>#{{ modelValue.id }}</small>
    </h3>
  </div>
</template>
