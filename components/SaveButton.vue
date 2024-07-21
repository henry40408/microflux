<script setup lang="ts">
const model = defineModel<MinifluxEntry>();

const { status, error, execute } = await useLazyFetch(
  `/api/entries/${model.value.id}/save`,
  { method: "POST", server: false, immediate: false, watch: false },
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
