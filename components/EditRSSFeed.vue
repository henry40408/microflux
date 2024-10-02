<template>
  <div>
    <div>
      <div>
        <NuxtLink :to="feed.site_url" target="_blank">{{
          feed.title
        }}</NuxtLink>
        ({{ unread }}/{{ read }})
      </div>
      <div>
        <small>feed URL: {{ feed.feed_url }}</small>
      </div>
      <div>
        <DeleteRSSFeed :feed="feed" @deleted="$emit('deleted')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MinifluxCompactFeed } from "~/server/trpc/routers/miniflux";

defineEmits<{
  deleted: [];
}>();

defineProps<{
  feed: MinifluxCompactFeed;
  read: number;
  unread: number;
}>();
</script>

<style scoped></style>
