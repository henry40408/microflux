<script setup lang="ts">
import { secondsToMilliseconds } from "date-fns";

import type { MinifluxGetFeedCompactEntriesResponse } from "../server/api/miniflux/entries.get";

const toolbarRef = ref<HTMLElement | null>(null);
const params = useUrlSearchParams("history");

const q = ref(params.q || "");
watch(q, (next) => {
  params.q = next;
  if (!next) delete params.q;
});

const requestPath = computed(() => {
  if (params.feedId)
    return `/api/miniflux/entries?q=${q.value}&feedId=${params.feedId}`;
  if (params.categoryId)
    return `/api/miniflux/entries?q=${q.value}&categoryId=${params.categoryId}`;
  return `/api/miniflux/entries?q=${q.value}`;
});

const { data, error, status, execute } =
  await useFetch<MinifluxGetFeedCompactEntriesResponse>(requestPath, {
    timeout: secondsToMilliseconds(30),
  });
const entries = computed(() => data.value?.entries || []);
watch(entries, async (next) => {
  toolbarRef.value?.scrollIntoView(true);
  const { categoryId, feedId } = params;
  if (next.length <= 0 && categoryId && feedId) {
    delete params.feedId;
    return;
  }
  if (next.length <= 0 && feedId) {
    delete params.categoryId;
    delete params.feedId;
    return;
  }
  if (next.length <= 0 && categoryId) {
    delete params.categoryId;
    delete params.feedId;
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
  const { feedId } = params;
  if (!feedId) return null;
  return feeds.value.find((f) => `${f.id}` === feedId);
});
const selectedCategory = computed(() => {
  const { categoryId } = params;
  if (!categoryId) return null;
  return categories.value.find((c) => `${c.id}` === categoryId);
});

async function setCategoryId(categoryId: number | undefined) {
  params.categoryId = categoryId?.toString() || "";
  if (!categoryId) delete params.categoryId;
}

async function setFeedId(feedId: number | undefined) {
  params.feedId = feedId?.toString() || "";
  if (!feedId) delete params.feedId;
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
        items-center
        md:text-left
        md:flex
        md:flex-wrap
        md:space-x-2
        md:space-y-0
      >
        <div space-x-2 items-end>
          <small>actions</small>
          <MyButton
            :error="error"
            :pending="status === 'pending'"
            @click="execute"
            >reload</MyButton
          >
        </div>
        <MySearch v-model="q" />
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
        @click-category="setCategoryId"
        @click-feed="setFeedId"
      />
      <em v-if="status !== 'pending' && data.entries.length <= 0" block mb-4>
        (empty)
      </em>
    </div>
    <div class="my-controls">
      <MyButton :error="error" :pending="status === 'pending'" @click="execute"
        >reload</MyButton
      >
      <MarkAllAsReadButton
        v-if="status !== 'pending' && count > 0"
        :entry-ids="entryIds"
        @mark-all-as-read="execute"
      />
    </div>
  </div>
</template>
