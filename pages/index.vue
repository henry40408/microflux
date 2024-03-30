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
const entriesUrl = computed(
  () => `/api/miniflux/entries?filter=${filter.value}`,
);
const { data, error, pending, refresh } = await useLazyFetch(entriesUrl, {
  key: "unread-entries-counters",
  refetch: true,
});

const entries = computed(() => {
  if (!data.value) return [];
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
  if (!data.value) return 0;
  return Object.values(data.value.counters.unreads).reduce(
    (acc, v) => acc + v,
    0,
  );
});

const titleTemplate = computed(() => `%s - Miniflux (${unread.value})`);
useHead({ titleTemplate });

function onEntryMarkedAsRead(ids: number[]) {
  data.value.entries = data.value.entries.map((e) => {
    if (ids.includes(e.id)) {
      e.read = true;
    }
    return e;
  });
}

async function onMarkAllAsReadClick() {
  const ids = entries.value.map((e) => e.id);
  await $fetch("/api/miniflux/entry", {
    method: "POST",
    body: { op: "mark-as-read", ids },
  });
  onRefreshClick();
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
  <div>
    <h1>Microflux - Miniflux</h1>
    <Navigation />
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
        <span v-if="pending">refreshing...</span>
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
          :key="entry.id"
          :entry="entry"
          class="actions"
          @mark-as-read="onEntryMarkedAsRead"
        />
        <EntryContent :content="entry.content">
          <EntryAction
            :key="entry.id"
            :entry="entry"
            class="actions"
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
        <Confirm @confirmed="onMarkAllAsReadClick">
          <span>mark all as read</span>
        </Confirm>
        |
        <span v-if="pending">refreshing...</span>
        <a v-else href="#" @click.prevent="onRefreshClick">refresh</a>
      </span>
    </div>
  </div>
</template>

<style scoped>
.error {
  background-color: pink;
  color: black;
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
