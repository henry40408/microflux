<script setup lang="ts">
import lodash from "lodash";

import type { MinifluxGetFeedCompactEntriesResponse } from "~/server/api/miniflux/entries.get";

const model = defineModel<MinifluxGetFeedCompactEntriesResponse>();
defineEmits<{
  clickCategory: [id: number];
  clickFeed: [id: number];
}>();

const unreadEntries = computed(
  () => model.value?.entries.filter((e) => e.status === "unread") || [],
);
const feeds = computed(() =>
  lodash(unreadEntries.value || [])
    .groupBy("feed.id")
    .map((entries) => ({ feed: entries[0].feed, count: entries.length }))
    .orderBy([(g) => g.count, (g) => g.feed.title], ["desc", "asc"])
    .value(),
);
const categories = computed(() =>
  lodash(unreadEntries.value || [])
    .groupBy("feed.category.id")
    .map((entries) => ({
      category: entries[0].feed.category,
      count: entries.length,
    }))
    .orderBy([(g) => g.count, (g) => g.category.title], ["desc", "asc"])
    .value(),
);
</script>

<template>
  <details>
    <summary>feeds &amp; categories</summary>
    <div space-y-2>
      <div flex flex-wrap un--ml-2 items-end>
        <small ml-2 block>categories</small>
        <div v-for="group in categories" :key="group.category.id" ml-2>
          <a
            href="#"
            @click.prevent="$emit('clickCategory', group.category.id)"
            >{{ group.category.title }}</a
          >
          <sup>{{ group.count }}</sup>
        </div>
        <em v-if="categories.length <= 0" block ml-2>(empty)</em>
      </div>
      <div flex flex-wrap un--ml-2 items-end>
        <small ml-2 block>feeds</small>
        <div v-for="group in feeds" :key="group.feed.id" ml-2>
          <a href="#" @click.prevent="$emit('clickFeed', group.feed.id)">{{
            group.feed.title
          }}</a>
          <sup>{{ group.count }}</sup>
        </div>
        <em v-if="categories.length <= 0" block ml-2>(empty)</em>
      </div>
    </div>
  </details>
</template>
