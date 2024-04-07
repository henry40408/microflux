<script setup lang="ts">
import sample from "lodash/sample";

import type { LinkdingBookmark, LinkdingBookmarksResponse } from "~/types";

const { data, pending, error, refresh } =
  await useLazyFetch<LinkdingBookmarksResponse>("/api/linkding/bookmarks", {
    key: "bookmarks",
  });

const bookmarks = computed(() => {
  if (data.value) return data.value.bookmarks;
  return [];
});
const count = computed(() => {
  if (data.value) return data.value.count;
  return 0;
});
const randomPicked = ref<LinkdingBookmark | undefined>();

const titleTemplate = computed(() => `(${count.value}) Linkding - %s`);
useHead({ titleTemplate });

function onBookmarksDelete(ids: number[]) {
  if (!data.value) return;
  data.value.bookmarks = data.value.bookmarks.filter(
    (b) => !ids.includes(b.id),
  );
  refresh();
}

function onDeleteAndNext(id: number) {
  randomPicked.value = undefined;
  onBookmarksDelete([id]);
  if (data.value) randomPicked.value = sample(data.value.bookmarks);
}

function onRandom() {
  if (!data.value) return;
  randomPicked.value = sample(data.value.bookmarks);
}

function onRandomDelete(id: number) {
  randomPicked.value = undefined;
  onBookmarksDelete([id]);
}
</script>

<template>
  <div>
    <h1>Microflux - Linkding</h1>
    <NavigationLine />
    <div v-if="error">
      <pre><code>{{ error }}</code></pre>
    </div>
    <h2>
      <span v-if="pending">...</span>
      <span v-else>{{ formatNumber(count) }}</span>
      <small text-gray-400 pl-1>bookmarks on server</small>
    </h2>
    <div pb-2>
      <div text-right space-y-2 md:flex md:space-x-2 md:space-y-0 md:text-left>
        <div><small>actions</small></div>
        <div>
          <span v-if="pending">...</span>
          <span v-else>
            <a href="#" @click.prevent="refresh()">refresh</a>
          </span>
        </div>
        <div>
          <a href="#" @click.prevent="onRandom">random</a>
        </div>
      </div>
      <h3 v-if="randomPicked">random picked</h3>
      <div
        v-if="randomPicked"
        border-1
        border-solid
        border-black
        px-2
        py-4
        dark:border-white
      >
        <h2 m-0>
          <a :href="randomPicked.url" target="_blank" rel="nofollow noopener">
            {{ getLinkdingTitle(randomPicked) }}
            <small text-gray-400>#{{ randomPicked.id }}</small>
          </a>
        </h2>
        <div mb-2>
          <small>{{ randomPicked.url }}</small>
        </div>
        <blockquote v-if="getLinkdingDescription(randomPicked)" my-4>
          {{ getLinkdingDescription(randomPicked) }}
        </blockquote>
        <div pb-2>
          <small pr-2>added</small>
          <span>{{ formatDate(randomPicked.date_added) }}</span>
        </div>
        <BookmarkAction
          :key="randomPicked.id"
          v-model="randomPicked"
          enable-next
          @deleted="onRandomDelete(randomPicked.id)"
          @delete-and-next="onDeleteAndNext(randomPicked.id)"
        />
      </div>
      <div v-for="(bookmark, index) in bookmarks" :key="bookmark.id">
        <h2 mb-0>
          <a :href="bookmark.url" target="_blank" rel="nofollow noopener">
            {{ getLinkdingTitle(bookmark) }}
            <small text-gray-400>#{{ bookmark.id }}</small>
          </a>
        </h2>
        <div>
          <small>{{ bookmark.url }}</small>
        </div>
        <blockquote v-if="getLinkdingDescription(bookmark)" my-4>
          {{ getLinkdingDescription(bookmark) }}
        </blockquote>
        <div v-else my-4 />
        <div>
          <ClientOnly>
            <small pr-2>added</small>
            <span>{{ formatDate(bookmark.date_added) }}</span>
          </ClientOnly>
        </div>
        <BookmarkAction
          :key="bookmark.id"
          v-model="bookmarks[index]"
          :enable-next="false"
          @deleted="onBookmarksDelete"
        />
      </div>
    </div>
    <div v-if="bookmarks.length <= 0" font-italic>(no bookmarks)</div>
  </div>
</template>
