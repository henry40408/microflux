<script setup lang="ts">
import { secondsToMilliseconds } from "date-fns";

import type { MinifluxGetFeedCompactEntriesResponse } from "../server/api/entries.get";

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
  if (next.length <= 0 && feedId) {
    navigateTo({ query: {} });
    return;
  }
  if (next.length <= 0 && categoryId) {
    navigateTo({ query: {} });
    return;
  }
});
const count = computed(
  () => entries.value.filter((e) => e.status === "unread").length,
);
const title = computed(() => `(${count.value}) miniflux`);
useHead({ title });

const entryIds = computed(() =>
  entries.value.filter((e) => e.status === "unread").map((e) => e.id),
);
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
  <div>
    <NavBar />
    <div>
      <MyButton :error="error" :loading="status === 'pending'" @click="execute"
        >reload</MyButton
      >
      <div>/</div>
      <div>{{ count }} entries</div>
      <div v-if="selectedFeed">/</div>
      <div v-if="selectedFeed">
        {{ selectedFeed.title }}
        <MyButton @click="setFeedId(undefined)">reset</MyButton>
      </div>
      <div v-if="selectedCategory">/</div>
      <div v-if="selectedCategory">
        {{ selectedCategory.title }}
        <MyButton @click="setCategoryId(undefined)">reset</MyButton>
      </div>
    </div>
    <div v-if="data">
      <Entry
        v-for="(entry, index) in data.entries"
        :key="entry.id"
        v-model="data.entries[index]"
      />
      <div v-if="data.entries.length <= 0">(empty)</div>
    </div>
    <div>
      <MyButton :error="error" :loading="status === 'pending'" @click="execute"
        >reload</MyButton
      >
      <MarkAllAsReadButton
        v-if="count > 0"
        :entryIds="entryIds"
        @mark-all-as-read="execute"
      />
    </div>
  </div>
</template>
