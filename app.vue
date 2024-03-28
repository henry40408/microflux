<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import uniqBy from "lodash/uniqBy";

// options
const autoMarkAsRead = useLocalStorage("auto-mark-as-read", false);

// fitler by category / feed
const selectedCategory = ref(null);
const selectedCategoryTitle = computed(
  () => categories.value.find((c) => c.id === selectedCategory.value).title,
);
const selectedFeed = ref(null);
const selectedFeedTitle = computed(
  () => feeds.value.find((f) => f.id === selectedFeed.value).title,
);

const entriesFilter = computed(() => {
  if (selectedCategory.value) {
    return `category:${selectedCategory.value}`;
  }
  if (selectedFeed.value) {
    return `feed:${selectedFeed.value}`;
  }
  return "";
});
const entriesUrl = computed(() => `/api/entries?filter=${entriesFilter.value}`);
const { data, pending, refresh } = await useFetch(entriesUrl, {
  refetch: true,
});

const filteredEntries = computed(() => {
  if (selectedCategory.value && selectedFeed.value) {
    return data.value.entries.filter((e) => e.feed.id === selectedFeed.value);
  }
  return data.value.entries;
});
const entriesCount = computed(() => filteredEntries.value.length);
const feeds = computed(() =>
  uniqBy(filteredEntries.value.map((e) => e.feed).flat(), (f) => f.id),
);
const categories = computed(() =>
  uniqBy(feeds.value.map((f) => f.category).flat(), (c) => c.id),
);
const unread = computed(() =>
  Object.values(data.value.counters.unreads).reduce((acc, v) => acc + v, 0),
);

async function fetchMarkAsRead(ids: number[]) {
  await $fetch("/api/entry", {
    method: "POST",
    body: { op: "mark-as-read", ids },
  });
}

function onCategoryClick(id) {
  selectedCategory.value = id;
}

function onEntryMarkedAsRead(ids: number[]) {
  data.value = {
    ...data.value,
    entries: data.value.entries.filter((e) => !ids.includes(e.id)),
  };
  if (data.value.entries.length <= 0) {
    selectedCategory.value = null;
    selectedFeed.value = null;
  }
  refresh();
}

function onFeedClick(id) {
  selectedFeed.value = id;
}

async function onMarkAllAsReadClick() {
  try {
    const ids = filteredEntries.value.map((e) => e.id);
    await fetchMarkAsRead(ids);
    onEntryMarkedAsRead(ids);
  } catch (err) {
    console.error("failed to mark as read", err);
  }
}

async function onTitleClicked(id) {
  if (!autoMarkAsRead.value) return;
  try {
    await fetchMarkAsRead([id]);
    onEntryMarkedAsRead([id]);
  } catch (err) {
    console.error("failed to mark as read", err);
  }
}
</script>

<template>
  <h1>Microflux</h1>
  <h2>options</h2>
  <label>
    <input v-model="autoMarkAsRead" type="checkbox" />
    Mark as read automatically
  </label>
  <h2>{{ entriesCount }} / {{ unread }} <small>unread entries</small></h2>
  <div class="actions">
    <small>actions</small>
    {{}}
    <span v-if="pending">loading...</span>
    <span v-else>
      <a href="#" @click.prevent="refresh">refresh</a>
      {{}}
      <span v-if="selectedCategory">
        <small>selected category</small>
        {{}}
        {{ selectedCategoryTitle }}
        {{}}
        <a href="#" @click.prevent="onCategoryClick(null)">clear</a>
      </span>
      {{}}
      <span v-if="selectedFeed">
        <small>selected feed</small>
        {{}}
        {{ selectedFeedTitle }}
        {{}}
        <a href="#" @click.prevent="onFeedClick(null)">clear</a>
      </span>
    </span>
  </div>
  <div v-if="filteredEntries.length > 0">
    <div v-for="entry in filteredEntries" :key="entry.id" class="entry">
      <h2>
        <a
          :href="entry.url"
          target="_blank"
          rel="nofollow"
          @click="onTitleClicked(entry.id)"
        >
          {{ entry.title }}
          <small> #{{ entry.id }}</small>
        </a>
      </h2>
      <div class="metadata">
        <small>feed</small>
        {{}}
        <a href="#" @click.prevent="onFeedClick(entry.feed.id)">
          {{ entry.feed.title }}
        </a>
        {{}}
        <small>category</small>
        {{}}
        <a href="#" @click.prevent="onCategoryClick(entry.feed.category.id)">
          {{ entry.feed.category.title }}
        </a>
      </div>
      <EntryAction
        :id="entry.id"
        :url="entry.url"
        :title="entry.title"
        @mark-as-read="onEntryMarkedAsRead"
        @open="onTitleClicked"
      />
      <EntryContent :content="entry.content">
        <EntryAction
          :id="entry.id"
          :url="entry.url"
          :title="entry.title"
          @mark-as-read="onEntryMarkedAsRead"
          @open="onTitleClicked"
        />
      </EntryContent>
    </div>
  </div>
  <div v-else>
    <em>(no entries)</em>
  </div>
  <div v-if="filteredEntries.length > 0" class="actions">
    <small>actions</small>
    {{}}
    <span v-if="pending">loading...</span>
    <span v-else>
      <Confirm question="are you sure?" @confirmed="onMarkAllAsReadClick">
        mark all as read
      </Confirm>
    </span>
  </div>
</template>

<style scoped>
small {
  color: lightgray;
}

.entry {
  margin: 0 0 1rem;
  .metadata {
    margin: 0 0 1rem;
  }
}

.actions {
  margin: 0 0 1rem;
}
</style>
