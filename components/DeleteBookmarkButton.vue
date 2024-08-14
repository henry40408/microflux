<script setup lang="ts">
import type { LinkdingBookmark } from "~/types";

const model = defineModel<LinkdingBookmark>({ required: true });
const emit = defineEmits<{ delete: [id: number] }>();

const deleted = await useLazyFetch(
  `/api/linkding/bookmarks/${model.value.id}`,
  {
    key: `delete-bookmark-${model.value.id}`,
    method: "DELETE",
    body: "",
    immediate: false,
    server: false,
    watch: false,
  },
);

async function onConfirm() {
  await deleted.execute();
  emit("delete", model.value.id);
}
</script>

<template>
  <MyConfirm
    danger
    :done="deleted.status.value === 'success'"
    :error="deleted.error.value"
    :loading="deleted.status.value === 'pending'"
    @confirm="onConfirm"
    >delete</MyConfirm
  >
</template>
