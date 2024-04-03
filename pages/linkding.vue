<script setup lang="ts">
import sample from "lodash/sample";
import pangu from "pangu";

const { data, pending, error, refresh } = await useLazyFetch(
  "/api/linkding/bookmarks",
  { key: "bookmarks" },
);

const bookmarks = computed(() => {
  if (data.value) return data.value.bookmarks;
  return [];
});
const count = computed(() => {
  if (data.value) return data.value.count;
  return 0;
});
const randomPicked = ref(null);

const titleTemplate = computed(() => `%s - Linkding (${count.value})`);
useHead({ titleTemplate });

function formatDate(date) {
  const formatter = new Intl.DateTimeFormat(navigator.language, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
  return pangu.spacing(formatter.format(new Date(date)));
}

function onBookmarksDelete(ids: number[]) {
  data.value.bookmarks = data.value.bookmarks.filter(
    (b) => !ids.includes(b.id),
  );
  refresh();
}

function onDeleteAndNext(id: number) {
  randomPicked.value = null;
  onBookmarksDelete([id]);
  randomPicked.value = sample(data.value.bookmarks);
}

function onRandom() {
  if (!data.value) return;
  randomPicked.value = sample(data.value.bookmarks);
}

function onRandomDelete(id: number) {
  randomPicked.value = null;
  onBookmarksDelete([id]);
}
</script>

<template>
  <div>
    <h1>Microflux - Linkding</h1>
    <Navigation />
    <div v-if="error">
      <pre><code>{{ error }}</code></pre>
    </div>
    <h2>
      <span v-if="pending">...</span>
      <span v-else>{{ count }}</span>
      {{}}
      <small>bookmarks on server</small>
    </h2>
    <div>
      <div>
        <small>actions</small>
        {{}}
        <span v-if="pending">loading...</span>
        <span v-else>
          <a href="#" @click.prevent="refresh">refresh</a>
        </span>
        |
        <a href="#" @click.prevent="onRandom">random</a>
      </div>
      <h3 v-if="randomPicked">random picked</h3>
      <div v-if="randomPicked">
        <h3>
          <a :href="randomPicked.url" target="_blank" rel="nofollow noopener">
            {{ getLinkdingTitle(randomPicked) }}
            <small>#{{ randomPicked.id }}</small>
          </a>
        </h3>
        <div>
          <small>{{ randomPicked.url }}</small>
        </div>
        <blockquote v-if="getLinkdingDescription(randomPicked)">
          {{ getLinkdingDescription(randomPicked) }}
        </blockquote>
        <div>
          <ClientOnly>
            <small>added</small>
            {{}}
            <span>{{ formatDate(randomPicked.date_added) }}</span>
          </ClientOnly>
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
        <h3>
          <a :href="bookmark.url" target="_blank" rel="nofollow noopener">
            {{ getLinkdingTitle(bookmark) }}
            <small>#{{ bookmark.id }}</small>
          </a>
        </h3>
        <div>
          <small>{{ bookmark.url }}</small>
        </div>
        <blockquote v-if="getLinkdingDescription(bookmark)">
          {{ getLinkdingDescription(bookmark) }}
        </blockquote>
        <div>
          <ClientOnly>
            <small>added</small>
            {{}}
            <span>{{ formatDate(bookmark.date_added) }}</span>
          </ClientOnly>
        </div>
        <BookmarkAction
          :key="bookmark.id"
          v-model="bookmarks[index]"
          @deleted="onBookmarksDelete"
        />
      </div>
    </div>
  </div>
</template>
