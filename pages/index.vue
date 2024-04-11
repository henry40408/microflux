<script setup lang="ts">
import uniqBy from "lodash/uniqBy";

import type { MinifluxEntriesResponse } from "~/types";

const entryRefs = ref<Record<number, Element>>({});
const headOfEntryList = ref<Element | null>(null);

const route = useRoute();
const selected = computed(() => ({
  category: route.query.category ? Number(route.query.category) : undefined,
  feed: route.query.feed ? Number(route.query.feed) : undefined,
}));

// fitler by category / feed
const filter = computed(() => {
  if (selected.value.category) {
    return `category:${selected.value.category}`;
  }
  if (selected.value.feed) {
    return `feed:${selected.value.feed}`;
  }
  return "";
});

const entriesUrl = computed(() => {
  if (filter.value) return `/api/miniflux/entries?filter=${filter.value}`;
  return "/api/miniflux/entries";
});
const { data, error, pending, refresh } =
  await useFetch<MinifluxEntriesResponse>(entriesUrl, {
    key: "unread-entries-counters",
  });

const entries = computed(() => {
  if (!data.value) return [];
  if (selected.value.category && selected.value.feed) {
    return data.value.entries.filter((e) => e.feed.id === selected.value.feed);
  }
  return data.value.entries;
});
watch(entries, () => {
  // reset refs when entries changes
  entryRefs.value = {};
});

const feeds = computed(() =>
  uniqBy(entries.value.map((e) => e.feed).flat(), (f) => f.id),
);
const categories = computed(() =>
  uniqBy(feeds.value.map((f) => f.category).flat(), (c) => c.id),
);
const unreadOnServer = computed(() => {
  if (!data.value) return 0;
  return Object.values(data.value.counters.unreads).reduce(
    (acc, v) => acc + v,
    0,
  );
});
const unreadEntries = computed(() =>
  entries.value.filter((e) => e.status === "unread"),
);
const titles = computed(() => {
  const s = selected.value;
  return {
    category: categories.value.find((c) => c.id === s.category)?.title,
    feed: feeds.value.find((f) => f.id === s.feed)?.title,
  };
});

const titleTemplate = computed(
  () => `(${unreadEntries.value.length}) Miniflux - %s`,
);
useHead({ titleTemplate });

async function fallbackIfEmpty() {
  if (unreadEntries.value.length <= 0) {
    // fallback to category when no entries listed
    await navigateTo({
      path: "/",
      query: { category: selected.value.category },
    });
  }
  await nextTick(); // ensure that unread entries is re-computed
  if (unreadEntries.value.length <= 0) {
    // fallback to all when no entries listed
    await navigateTo({ path: "/" });
  }
  if (selected.value.category || selected.value.feed) {
    headOfEntryList.value?.scrollIntoView();
  }
}

async function filterByCategory(id?: number) {
  await navigateTo({
    path: "/",
    query: { category: id, feed: selected.value.feed },
  });
  await fallbackIfEmpty();
}

async function filterByFeed(id?: number) {
  await navigateTo({
    path: "/",
    query: { category: selected.value.category, feed: id },
  });
  await fallbackIfEmpty();
}

async function refreshAndFallback() {
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
      refreshAndFallback();
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

function setEntryRef(id: number, el: unknown) {
  if (el instanceof Element) {
    entryRefs.value[id] = el;
  }
}
</script>

<template>
  <div>
    <PageTitle>Miniflux</PageTitle>
    <NavigationLine />
    <div v-if="error">
      <pre><code>{{ error }}</code></pre>
    </div>
    <OptionsPane />
    <span ref="headOfEntryList" />
    <h2>
      {{ formatNumber(unreadEntries.length) }}
      <small text-gray-400>on page</small>
      {{ pending ? "..." : formatNumber(unreadOnServer) }}
      <small text-gray-400>on server</small>
    </h2>
    <div>
      <div
        pb-2
        space-y-2
        text-right
        md:flex
        md:space-x-2
        md:space-y-0
        md:text-left
      >
        <div><small>actions</small></div>
        <div>
          <div v-if="pending">...</div>
          <div v-else>
            <a href="#" @click.prevent="refreshAndFallback">refresh</a>
          </div>
        </div>
        <div v-if="selected.category">
          <small pr-1>selected category</small>
          <span pr-1>{{ titles.category }}</span>
          <a href="#" @click.prevent="filterByCategory()">clear</a>
        </div>
        <div v-if="selected.feed">
          <small pr-1>selected feed</small>
          <span pr-1>{{ titles.feed }}</span>
          <a href="#" @click.prevent="filterByFeed()">clear</a>
        </div>
      </div>
    </div>
    <div v-for="(entry, index) in entries" :key="entry.id">
      <h2 :ref="(el) => setEntryRef(entry.id, el)">
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
        @collapsed="entryRefs[entry.id].scrollIntoView()"
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
      <div v-if="unreadEntries.length > 0">
        <span v-if="markAllAsReadStatus === 'pending'">marking...</span>
        <span v-else>
          <ConfirmButton @confirmed="executeMarkAllAsRead">
            <span>mark {{ formatNumber(unreadEntries.length) }} as read</span>
          </ConfirmButton>
          <span v-if="markAllAsReadStatus === 'error'" pl-1>failed!</span>
        </span>
      </div>
      <div>
        <span v-if="pending">...</span>
        <a v-else href="#" @click.prevent="refreshAndFallback">refresh</a>
      </div>
    </div>
  </div>
</template>
