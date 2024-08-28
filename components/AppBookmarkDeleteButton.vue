<script setup lang="ts">
import type { LinkdingBookmark } from "~/schema/linkding";

const model = defineModel<LinkdingBookmark>({ required: true });
const emit = defineEmits<{ delete: [id: number] }>();

const { $client } = useNuxtApp();
const fetched = await useAsyncData(
  `delete-bookmark-${model.value.id}`,
  () => $client.linkding.deleteBookmark.mutate(model.value.id),
  { immediate: false, server: false },
);

async function onConfirm() {
  await fetched.execute();
  emit("delete", model.value.id);
}
</script>

<template>
  <BaseConfirm
    danger
    :done="fetched.status.value === 'success'"
    :error="fetched.error.value"
    :loading="fetched.status.value === 'pending'"
    @confirm="onConfirm"
    >🗑️ delete</BaseConfirm
  >
</template>
