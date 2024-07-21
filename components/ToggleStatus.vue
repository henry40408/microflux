<script setup lang="ts">
const model = defineModel<MinifluxEntry>();

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
