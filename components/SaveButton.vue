<script setup lang="ts">
import { secondsToMilliseconds } from "date-fns";

import type { MinifluxCompactEntry } from "../server/api/miniflux/entries.get";

const model = defineModel<MinifluxCompactEntry>({ required: true });

const saved = await useLazyFetch(
  `/api/miniflux/entries/${model.value.id}/save`,
  {
    key: `save-${model.value.id}`,
    method: "POST",
    immediate: false,
    server: false,
    timeout: secondsToMilliseconds(30),
    watch: false,
  },
);
</script>

<template>
  <MyButton
    :done="saved.status.value === 'success'"
    :error="saved.error.value"
    :loading="saved.status.value === 'pending'"
    @click="saved.execute"
    >save</MyButton
  >
</template>
