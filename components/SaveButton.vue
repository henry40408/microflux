<script setup lang="ts">
import { secondsToMilliseconds } from "date-fns";

import type { MinifluxEntry } from "../types";

const model = defineModel<MinifluxEntry>({ required: true });

const { status, error, execute } = await useLazyFetch(
  `/api/entries/${model.value.id}/save`,
  {
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
    :done="status === 'success'"
    :error="error"
    :loading="status === 'pending'"
    @click="execute"
    >save</MyButton
  >
</template>
