<script setup lang="ts">
import { secondsToMilliseconds } from "date-fns";

import type { MinifluxGetFeedCompactEntriesResponse } from "../server/api/entries.get";

useHead({
  title: "Microflux",
});

const route = useRoute();

const requestPath = computed(() => {
  const { categoryId, feedId } = route.query;
  if (feedId) return `/api/entries?feedId=${feedId}`;
  if (categoryId) return `/api/entries?categoryId=${categoryId}`;
  return "/api/entries";
});

const { data, error, status, execute } =
  await useFetch<MinifluxGetFeedCompactEntriesResponse>(requestPath, {
    timeout: secondsToMilliseconds(30),
  });
const entries = computed(() => data.value?.entries || []);
watch(entries, (next) => {
  const { categoryId, feedId } = route.query;
  if (next.length <= 0 && categoryId && feedId) {
    navigateTo({ query: { categoryId } });
    return;
  }
  if (next.length <= 0 && categoryId) {
    navigateTo({ query: {} });
    return;
  }
});
const feeds = computed(
  () =>
    Object.values(
      Object.fromEntries(entries.value.map((e) => [e.feed.id, e.feed])),
    ) || [],
);
const categories = computed(
  () =>
    Object.values(
      Object.fromEntries(feeds.value.map((f) => [f.category.id, f.category])),
    ) || [],
);
const selectedFeed = computed(() => {
  const { feedId } = route.query;
  if (!feedId) return null;
  return feeds.value.find((f) => `${f.id}` === feedId);
});
const selectedCategory = computed(() => {
  const { categoryId } = route.query;
  if (!categoryId) return null;
  return categories.value.find((c) => `${c.id}` === categoryId);
});

async function setCategoryId(categoryId: number | undefined) {
  const { feedId } = route.query;
  await navigateTo({ query: { categoryId, feedId } });
}

async function setFeedId(feedId: number | undefined) {
  const { categoryId } = route.query;
  await navigateTo({ query: { categoryId, feedId } });
}
</script>

<template>
  <div class="container mx-auto space-y-4">
    <div>
      <MyButton :error="error" :loading="status === 'pending'" @click="execute"
        >reload</MyButton
      >
      <span v-if="selectedFeed"
        >/ {{ selectedFeed.title }}
        <MyButton @click="setFeedId(undefined)">reset</MyButton>
      </span>
      <span v-if="selectedCategory"
        >/ {{ selectedCategory.title }}
        <MyButton @click="setCategoryId(undefined)">reset</MyButton>
      </span>
    </div>
    <div class="space-y-4" v-if="data">
      <Entry
        v-for="(entry, index) in data.entries"
        :key="entry.id"
        v-model="data.entries[index]"
      />
    </div>
  </div>
</template>
