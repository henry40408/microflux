<script setup lang="ts">
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
</script>

<template>
  <div>
    <h1>Microflux - Linkding</h1>
    <Navigation />
    <div v-if="error">
      <pre><code class="error">{{ error }}</code></pre>
    </div>
    <h2>{{ count }} <small>bookmarks on server</small></h2>
    <div>
      <small>actions</small>
      {{}}
      <span v-if="pending">loading...</span>
      <span v-else>
        <a href="#" @click.prevent="refresh">refresh</a>
      </span>
      <div v-for="bookmark in bookmarks" :key="bookmark.id" class="bookmark">
        <h3 class="title">
          <a :href="bookmark.url" target="_blank" rel="nofollow noopener">
            {{ getLinkdingTitle(bookmark) }}
            <small>#{{ bookmark.id }}</small>
          </a>
        </h3>
        <div class="metadata">
          <small>{{ bookmark.url }}</small>
        </div>
        <blockquote class="description">
          {{ getLinkdingDescription(bookmark) }}
        </blockquote>
        <div class="metadata">
          <ClientOnly>
            <small>added</small>
            {{}}
            <span>{{ formatDate(bookmark.date_added) }}</span>
          </ClientOnly>
        </div>
        <BookmarkAction :bookmark="bookmark" @deleted="onBookmarksDelete" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.error {
  background-color: pink;
  color: black;
}

.bookmark {
  .title {
    margin-bottom: 0;
    small {
      color: lightgray;
    }
  }
  .metadata,
  .description {
    margin: 0 0 0.6rem;
  }
}
</style>
