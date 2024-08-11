<script setup lang="ts">
import { secondsToMilliseconds } from "date-fns";

import type { MinifluxGetFeedCompactEntriesResponse } from "../server/api/miniflux/entries.get";

const toolbarRef = ref<HTMLElement | null>(null);
const route = useRoute();

const requestPath = computed(() => {
  const { categoryId, feedId } = route.query;
  if (feedId) return `/api/miniflux/entries?feedId=${feedId}`;
  if (categoryId) return `/api/miniflux/entries?categoryId=${categoryId}`;
  return "/api/miniflux/entries";
});

const { data, error, status, execute } =
  await useFetch<MinifluxGetFeedCompactEntriesResponse>(requestPath, {
    timeout: secondsToMilliseconds(30),
  });
const entries = computed(() => data.value?.entries || []);
watch(entries, async (next) => {
  toolbarRef.value?.scrollIntoView(true);
  const { categoryId, feedId } = route.query;
  if (next.length <= 0 && categoryId && feedId) {
    await navigateTo({ query: { categoryId } });
    return;
  }
  if (next.length <= 0 && feedId) {
    await navigateTo({ query: {} });
    return;
  }
  if (next.length <= 0 && categoryId) {
    await navigateTo({ query: {} });
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
    <div space-y-2>
      <NavBar />
      <div
        ref="toolbarRef"
        space-y-2
        text-right
        md:text-left
        md:flex
        md:space-x-2
        md:space-y-0
      >
        <div space-x-2 items-end>
          <small>actions</small>
          <MyButton
            :error="error"
            :loading="status === 'pending'"
            @click="execute"
            >reload</MyButton
          >
        </div>
        <div>{{ count }} entries</div>
        <div v-if="selectedFeed">
          {{ selectedFeed.title }}
          <MyButton @click="setFeedId(undefined)">reset</MyButton>
        </div>
        <div v-if="selectedCategory">
          {{ selectedCategory.title }}
          <MyButton @click="setCategoryId(undefined)">reset</MyButton>
        </div>
      </div>
    </div>
    <div v-if="data">
      <MyOutlines
        v-model="data"
        @click-feed="setFeedId"
        @click-category="setCategoryId"
      />
      <MyEntry
        v-for="(entry, index) in data.entries"
        :key="entry.id"
        v-model="data.entries[index]"
      />
      <blockquote v-if="status !== 'pending' && data.entries.length <= 0">
        empty
      </blockquote>
    </div>
    <div class="my-controls">
      <MyButton :error="error" :loading="status === 'pending'" @click="execute"
        >reload</MyButton
      >
      <MarkAllAsReadButton
        v-if="count > 0"
        :entry-ids="entryIds"
        @mark-all-as-read="execute"
      />
    </div>
  </div>
</template>
