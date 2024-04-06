<script setup lang="ts">
import uniqBy from "lodash/uniqBy";

const entriesRefs = ref([]);

const route = useRoute();

// fitler by category / feed
const category = computed(() =>
  route.query.category ? Number(route.query.category) : undefined,
);
const categoryTitle = computed(
  () => categories.value.find((c) => c.id === category.value)?.title,
);
const feed = computed(() =>
  route.query.feed ? Number(route.query.feed) : undefined,
);
const feedTitle = computed(
  () => feeds.value.find((f) => f.id === feed.value)?.title,
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
const entriesUrl = computed(() => {
  if (filter.value) return `/api/miniflux/entries?filter=${filter.value}`;
  return "/api/miniflux/entries";
});
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
const unreadEntries = computed(() =>
  entries.value.filter((e) => e.status === "unread"),
);

const titleTemplate = computed(() => `%s - Miniflux (${unread.value})`);
useHead({ titleTemplate });

async function fallbackIfEmpty() {
  if (unreadEntries.value.length <= 0) {
    // fallback to category when no entries listed
    await navigateTo({ path: "/", query: { category: category.value } });
  }
  if (unreadEntries.value.length <= 0) {
    // fallback to all when no entries listed
    await navigateTo({ path: "/" });
  }
}

async function filterByCategory(id) {
  await navigateTo({ path: "/", query: { category: id, feed: feed.value } });
  await fallbackIfEmpty();
}

async function filterByFeed(id) {
  await navigateTo({
    path: "/",
    query: { category: category.value, feed: id },
  });
  await fallbackIfEmpty();
}

async function onRefresh() {
  await refresh();
  await fallbackIfEmpty();
}

function useMarkAllAsRead() {
  const status = ref("idle");
  const execute = async () => {
    try {
      status.value = "pending";
      const ids = entries.value.map((e) => e.id);
      await $fetch("/api/miniflux/entry", {
        method: "POST",
        body: { op: "mark-many-as-read", ids },
      });
      onRefresh();
      status.value = "success";
    } catch (err) {
      console.error("failed to mark all as read");
      status.value = "error";
    }
  };
  return { status, execute };
}
const { status: markAllAsReadStatus, execute: executeMarkAllAsRead } =
  useMarkAllAsRead();
</script>

<template>
  <div>
    <h1>Microflux - Miniflux</h1>
    <NavigationLine />
    <div v-if="error">
      <pre><code>{{ error }}</code></pre>
    </div>
    <h2>
      {{ formatNumber(entries.length) }}
      <small text-gray-400>on page</small>
      {{ pending ? "..." : formatNumber(unread) }}
      <small text-gray-400>on server</small>
    </h2>
    <div>
      <div
        pb-2
        space-y-2
        text-right
        md:flex
        md:space-x-1
        md:space-y-0
        md:text-left
      >
        <div><small>actions</small></div>
        <div>
          <div v-if="pending">...</div>
          <div v-else><a href="#" @click.prevent="onRefresh">refresh</a></div>
        </div>
        <div v-if="category">
          <small pr-1>selected category</small>
          <span pr-1>{{ categoryTitle }}</span>
          <a href="#" @click.prevent="filterByCategory(null)">clear</a>
        </div>
        <div v-if="feed">
          <small pr-1>selected feed</small>
          <span pr-1>{{ feedTitle }}</span>
          <a href="#" @click.prevent="filterByFeed(null)">clear</a>
        </div>
      </div>
    </div>
    <div v-for="(entry, index) in entries" :key="entry.id" ref="entriesRefs">
      <h2>
        <a
          :class="{ 'text-gray-400': entry.status === 'read' }"
          :href="entry.url"
          target="_blank"
          rel="nofollow noopener"
        >
          {{ entry.title }}
          <small text-gray-400> #{{ entry.id }}</small>
        </a>
      </h2>
      <div pb-2 space-x-2 space-y-2 text-right md:flex md:space-y-0>
        <div>
          <small pr-2>feed</small>
          <a href="#" @click.prevent="filterByFeed(entry.feed.id)">
            {{ entry.feed.title }}
          </a>
        </div>
        <div>
          <small pr-2>category</small>
          <a href="#" @click.prevent="filterByCategory(entry.feed.category.id)">
            {{ entry.feed.category.title }}
          </a>
        </div>
      </div>
      <EntryAction v-model="entries[index]" />
      <EntryContent
        v-model="entries[index]"
        @collapsed="entriesRefs[index].scrollIntoView()"
      >
        <EntryAction v-model="entries[index]" pb-2 />
      </EntryContent>
    </div>
    <div v-if="entries.length <= 0" font-italic>(no entries)</div>
    <div
      v-if="entries.length > 0"
      pb-10
      space-y-2
      text-right
      md:flex
      md:pb-5
      md:space-x-2
      md:space-y-0
      md:text-left
    >
      <div><small>actions</small></div>
      <div>
        <span v-if="markAllAsReadStatus === 'pending'">marking...</span>
        <span v-else>
          <ConfirmButton @confirmed="executeMarkAllAsRead">
            <span>mark {{ formatNumber(entries.length) }} as read</span>
          </ConfirmButton>
          <span v-if="markAllAsReadStatus === 'error'" pl-1>failed!</span>
        </span>
      </div>
      <div>
        <span v-if="pending">...</span>
        <a v-else href="#" @click.prevent="onRefresh">refresh</a>
      </div>
    </div>
  </div>
</template>
