<script setup lang="ts">
const model = defineModel<MinifluxEntry>();

const pending = ref(false);
const error = ref("");

async function onClick() {
  try {
    const nextStatus = model.value.status === "unread" ? "read" : "unread";
    error.value = "";
    pending.value = true;
    await $fetch("/api/entries", {
      method: "PUT",
      body: {
        entryIds: [model.value.id],
        status: nextStatus,
      },
    });
    model.value.status = nextStatus;
  } catch (e) {
    error.value = e;
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <MyButton :error="error" :loading="pending" @click="onClick"
    >mark as {{ modelValue.status === "unread" ? "read" : "unread" }}</MyButton
  >
</template>
