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
        <BookmarkTitle v-model="randomPicked" />
        <BookmarkSubtitle v-model="randomPicked" />
        <BookmarkDescription v-model="randomPicked" />
        <BookmarkMetadata v-model="randomPicked" />
        <BookmarkAction
          :key="randomPicked.id"
          v-model="randomPicked"
          enable-next
          @deleted="onRandomDelete(randomPicked.id)"
          @delete-and-next="onDeleteAndNext(randomPicked.id)"
        />
      </div>
      <div v-for="(bookmark, index) in bookmarks" :key="bookmark.id">
        <BookmarkTitle v-model="bookmarks[index]" mt-6 />
        <BookmarkSubtitle v-model="bookmarks[index]" />
        <BookmarkDescription v-model="bookmarks[index]" />
        <BookmarkMetadata v-model="bookmarks[index]" />
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
