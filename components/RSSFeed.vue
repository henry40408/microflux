<template>
  <div>
    <h2>
      <NuxtLink :to="feed.site_url">{{ feed.title }}</NuxtLink>
      ({{ unread }}/{{ read }})
    </h2>
    <p>
      <small>{{ feed.feed_url }}</small>
    </p>
    <p>
      <span>edit</span>,
      <BaseConfirm
        once
        :status="deleted.status.value"
        :error="deleted.error"
        @confirm="doDelete"
        >delete</BaseConfirm
      >
    </p>
  </div>
</template>

<script setup lang="ts">
import type { MinifluxCompactFeed } from "~/server/trpc/routers/miniflux";

const props = defineProps<{
  feed: MinifluxCompactFeed;
  read: number;
  unread: number;
}>();

const emit = defineEmits<{
  deleted: [id: number];
}>();

const { $client } = useNuxtApp();
const deleted = useAsyncData(
  `delete-feed:${props.feed.id}`,
  () => $client.miniflux.deleteFeed.mutate(props.feed.id),
  { immediate: false, server: false },
);

async function doDelete() {
  await deleted.execute();
  emit("deleted", props.feed.id);
}
</script>

<style scoped></style>
