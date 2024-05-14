<script setup lang="ts">
import { useWindowScroll } from "@vueuse/core";
import orderBy from "lodash/orderBy";
import uniqBy from "lodash/uniqBy";

import type { MinifluxEntriesResponse } from "~/types";

const entryRefs = ref<Record<number, Element>>({});
const headOfEntryList = ref<Element | null>(null);

const scrollingDown = ref(false);
const { y: windowY } = useWindowScroll();
watch(windowY, (next, prev) => {
  scrollingDown.value = next - prev > 0;
});

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
const categoryUnreads = computed(() =>
  orderBy(
    categories.value.map((c) => ({
      ...c,
      count: unreadEntries.value.filter((e) => e.feed.category.id === c.id)
        .length,
    })),
    ["count", "title"],
    ["desc", "asc"],
  ),
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
      for (const entry of entries.value) {
        entry.status = "read";
      }
      await $fetch("/api/miniflux/entry", {
        method: "POST",
        body: { op: "mark-many-as-read", ids },
      });
      refreshAndFallback();
      status.value = "success";
    } catch (err) {
      for (const entry of entries.value) {
        entry.status = "unread";
      }
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

// redirect when no entries found with current filter
if (unreadEntries.value.length <= 0) {
  if (selected.value.feed) {
    await navigateTo({
      path: "/",
      query: { category: selected.value.category },
    });
  }
  if (selected.value.category) {
    await navigateTo({ path: "/" });
  }
}
</script>

<template>
  <div>
    <PageTitle>Miniflux</PageTitle>
    <NavigationLine />
    <div v-if="error">
      <pre><code bg-pink-300 text-black>&#x274C; {{ error }}</code></pre>
    </div>
    <OptionsPane />
    <span ref="headOfEntryList" />
    <h3>
      <span v-if="pending">...</span>
      <span v-else>
        {{ formatNumber(unreadEntries.length) }}
        <small text-gray-400>on page</small>
        {{ formatNumber(unreadOnServer) }}
        <small text-gray-400>on server</small>
      </span>
    </h3>
    <div>
      <div
        pb-2
        space-y-2
        text-right
        md:flex
        md:flex-wrap
        md:space-y-0
        md:text-left
        md:text-nowrap
      >
        <div md:mr-2><small>actions</small></div>
        <div md:mr-2>
          <div v-if="pending">...</div>
          <div v-else>
            <a href="#" @click.prevent="refreshAndFallback">
              &#x1F504; refresh
            </a>
          </div>
        </div>
        <div v-if="selected.category" md:mr-2>
          <small pr-1>selected category</small>
          <span pr-1>{{ titles.category }}</span>
          <a href="#" @click.prevent="filterByCategory()">clear</a>
        </div>
        <div v-if="selected.feed" md:mr-2>
          <small pr-1>selected feed</small>
          <span pr-1>{{ titles.feed }}</span>
          <a href="#" @click.prevent="filterByFeed()">clear</a>
        </div>
      </div>
    </div>
    <div text-right md:flex md:flex-wrap>
      <div mb-2 md:mr-2><small>count by category</small></div>
      <div
        v-for="category in categoryUnreads"
        :key="category.id"
        mb-2
        md:mr-1
        text-nowrap
      >
        ({{ category.count }})
        <a href="#" @click.prevent="filterByCategory(category.id)">
          {{ category.title }}
        </a>
      </div>
    </div>
    <div>
      <div v-for="(entry, index) in entries" :key="entry.id">
        <EntryItem
          v-model="entries[index]"
          :scrolling-down="scrollingDown"
          @category-click="filterByCategory(entry.feed.category.id)"
          @content-collapsed="entryRefs[entry.id].scrollIntoView()"
          @feed-click="filterByFeed(entry.feed.id)"
          @set-model-ref="(el: HTMLElement) => setEntryRef(entry.id, el)"
        />
      </div>
    </div>
    <div v-if="entries.length <= 0" font-italic py-2>(no entries)</div>
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
      <div v-if="!pending && unreadEntries.length > 0">
        <span v-if="markAllAsReadStatus === 'pending'">marking...</span>
        <span v-else>
          <ConfirmButton @confirmed="executeMarkAllAsRead">
            <span>
              &#x2705; mark
              {{ formatNumber(unreadEntries.length) }}
              as read
            </span>
          </ConfirmButton>
          <span v-if="markAllAsReadStatus === 'error'" pl-1>failed!</span>
        </span>
      </div>
      <div>
        <span v-if="pending">...</span>
        <a v-else href="#" @click.prevent="refreshAndFallback">
          &#x1F504; refresh
        </a>
      </div>
    </div>
  </div>
</template>
