<template>
  <BaseConfirm
    :error="deleted.error"
    :status="deleted.status.value"
    @confirm="doDelete"
    >delete</BaseConfirm
  >
</template>

<script setup lang="ts">
import type { MinifluxCompactFeed } from "~/server/trpc/routers/miniflux";

const props = defineProps<{
  feed: MinifluxCompactFeed;
}>();

const emit = defineEmits<{ deleted: [] }>();

const { $client } = useNuxtApp();
const deleted = useAsyncData(
  `delete-feed:${props.feed.id}`,
  () => $client.miniflux.deleteFeed.mutate(props.feed.id),
  { immediate: false, server: false },
);

async function doDelete() {
  await deleted.execute();
  emit("deleted");
}
</script>

<style scoped></style>
