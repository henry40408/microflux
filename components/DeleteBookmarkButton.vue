<script setup lang="ts">
import type { LinkdingBookmark } from "~/types";

const model = defineModel<LinkdingBookmark>({ required: true });
const emit = defineEmits<{ delete: [id: number] }>();

const { data, error, status, execute } = await useLazyFetch(
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
  await execute();
  emit("delete", model.value.id);
}
</script>

<template>
  <MyConfirm
    danger
    :done="!!data"
    :error="error"
    :loading="status === 'pending'"
    @confirm="onConfirm"
    >delete</MyConfirm
  >
</template>
