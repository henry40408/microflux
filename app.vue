<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import uniqBy from "lodash/uniqBy";

// options
const autoMarkAsRead = useLocalStorage("auto-mark-as-read", false);

// route
const { query } = useRoute();
const router = useRouter();

// fitler by category / feed
const category = ref(query.category ? Number(query.category) : null);
const categoryTitle = computed(
  () => categories.value.find((c) => c.id === category.value)?.title,
);
const feed = ref(query.feed ? Number(query.feed) : null);
const feedTitle = computed(
  () => feeds.value.find((f) => f.id === feed.value)?.title,
);

watch(
  () => [category.value || undefined, feed.value || undefined],
  (next) => {
    const [category, feed] = next;
    router.push({
      path: "/",
      query: { category, feed },
    });
  },
);

const filter = computed(() => {
  if (category.value) {
    return `category:${category.value}`;
  }
  if (feed.value) {
    return `feed:${feed.value}`;
  }
  return "";
});
const entriesUrl = computed(() => `/api/entries?filter=${filter.value}`);
const { data, error, pending, refresh } = await useFetch(entriesUrl, {
  refetch: true,
});

const entries = computed(() => {
  if (category.value && feed.value) {
    return data.value.entries.filter((e) => e.feed.id === feed.value);
  }
  return data.value.entries;
});

const feeds = computed(() =>
  uniqBy(entries.value.map((e) => e.feed).flat(), (f) => f.id),
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
  onEntryMarkedAsRead(ids);
}

async function onEntryMarkedAsRead(ids: number[]) {
  data.value.entries = data.value.entries.filter((e) => !ids.includes(e.id));

  // fallback to category if no entries
  if (entries.value.length <= 0) {
    feed.value = null;
  }

  await nextTick();

  // fallback to all if no entries
  if (entries.value.length <= 0) {
    category.value = null;
  }

  refresh();
}

async function onMarkAllAsRead() {
  try {
    const ids = entries.value.map((e) => e.id);
    await fetchMarkAsRead(ids);
  } catch (err) {
    console.error("failed to mark as read", err);
  }
}

async function onTitleClicked(id) {
  if (!autoMarkAsRead.value) return;
  try {
    await fetchMarkAsRead([id]);
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
  <h2>{{ entries.length }} / {{ unread }} <small>unread entries</small></h2>
  <div>
    <small>actions</small>
    {{}}
    <span v-if="error">{{ error }}</span>
    <span v-else-if="pending">loading...</span>
    <span v-else>
      <a href="#" @click.prevent="refresh">refresh</a>
      {{}}
      <span v-if="category">
        <small>selected category</small>
        {{}}
        {{ categoryTitle }}
        {{}}
        <a href="#" @click.prevent="category = null">clear</a>
      </span>
      {{}}
      <span v-if="feed">
        <small>selected feed</small>
        {{}}
        {{ feedTitle }}
        {{}}
        <a href="#" @click.prevent="feed = null">clear</a>
      </span>
    </span>
  </div>
  <div v-if="entries.length > 0">
    <div v-for="entry in entries" :key="entry.id" class="entry">
      <h2 class="title">
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
        <a href="#" @click.prevent="feed = entry.feed.id">
          {{ entry.feed.title }}
        </a>
        {{}}
        <small>category</small>
        {{}}
        <a href="#" @click.prevent="category = entry.feed.category.id">
          {{ entry.feed.category.title }}
        </a>
      </div>
      <EntryAction
        :id="entry.id"
        :url="entry.url"
        :title="entry.title"
        class="actions"
        @mark-as-read="onEntryMarkedAsRead"
      />
      <EntryContent :content="entry.content">
        <EntryAction
          :id="entry.id"
          :url="entry.url"
          :title="entry.title"
          @mark-as-read="onEntryMarkedAsRead"
        />
      </EntryContent>
    </div>
  </div>
  <div v-else>
    <em>(no entries)</em>
  </div>
  <div v-if="entries.length > 0">
    <small>actions</small>
    {{}}
    <span v-if="pending">loading...</span>
    <span v-else>
      <Confirm question="are you sure?" @confirmed="onMarkAllAsRead">
        mark all as read
      </Confirm>
    </span>
  </div>
</template>

<style scoped>
.entry {
  margin: 0 0 1rem;
  .title small {
    color: lightgray;
  }
  .actions,
  .metadata {
    margin: 0 0 0.6rem;
  }
}
</style>
