<script setup lang="ts">
import uniqBy from "lodash/uniqBy";

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
  if (error.value) return [];
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
const unread = computed(() => {
  if (error.value) return 0;
  return Object.values(data.value.counters.unreads).reduce(
    (acc, v) => acc + v,
    0,
  );
});

async function fetchMarkAsRead(ids: number[]) {
  await $fetch("/api/entry", {
    method: "POST",
    body: { op: "mark-as-read", ids },
  });
  onEntryMarkedAsRead(ids);
}

function onEntryMarkedAsRead(ids: number[]) {
  data.value.entries = data.value.entries.map((e) => {
    if (ids.includes(e.id)) {
      e.read = true;
    }
    return e;
  });
}

async function onMarkAllAsRead() {
  try {
    const ids = entries.value.map((e) => e.id);
    await fetchMarkAsRead(ids);
    await onRefreshClick();
  } catch (err) {
    console.error("failed to mark as read", err);
  }
}

async function onRefreshClick() {
  await refresh();
  if (entries.value.length <= 0) {
    // fallback to category when no entries listed
    feed.value = null;
  }
  // wait for entries are computed
  await nextTick();
  if (entries.value.length <= 0) {
    // fallback to all when no entries listed
    category.value = null;
  }
}
</script>

<template>
  <h1>Microflux</h1>
  <div v-if="error">
    <pre><code class="error">{{ error }}</code></pre>
  </div>
  <h2>
    {{ entries.length }}
    <small>entries on page</small>
    / {{ pending ? "..." : unread }}
    <small>unread on server</small>
  </h2>
  <div>
    <div class="actions">
      <small>actions</small>
      {{}}
      <span v-if="pending">loading...</span>
      <span v-else>
        <a href="#" @click.prevent="onRefreshClick">refresh</a>
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
  </div>
  <div v-if="entries.length > 0">
    <div v-for="entry in entries" :key="entry.id" class="entry">
      <h2 :class="{ title: true, read: entry.read }">
        <a :href="entry.url" target="_blank" rel="nofollow noopener">
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
        :entry="entry"
        class="actions"
        @mark-as-read="onEntryMarkedAsRead"
      />
      <EntryContent :content="entry.content">
        <EntryAction :entry="entry" @mark-as-read="onEntryMarkedAsRead" />
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
      |
      <a href="#" @click.prevent="onRefreshClick">refresh</a>
    </span>
  </div>
</template>

<style scoped>
.error {
  background-color: red;
  color: white;
}

.actions {
  margin: 0 0 0.6rem;
}

.entry {
  margin: 0 0 1rem;
  .title small,
  .title.read a {
    color: lightgray;
  }
  .actions,
  .metadata {
    margin: 0 0 0.6rem;
  }
}
</style>
