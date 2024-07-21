<script setup lang="ts">
import { secondsToMilliseconds } from "date-fns";

const model = defineModel<MinifluxEntry>();

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
