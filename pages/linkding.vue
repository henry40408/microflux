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

function getTitle(bookmark) {
  return bookmark.title || bookmark.website_title;
}

function formatDate(date) {
  const formatter = new Intl.DateTimeFormat(navigator.language, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
  return pangu.spacing(formatter.format(new Date(date)));
}
</script>

<template>
  <div>
    <h1>Microflux - Linkding</h1>
    <Navigation />
    <div v-if="error">
      <pre><code class="error">{{ error }}</code></pre>
    </div>
    <h2>bookmarks</h2>
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
            {{ getTitle(bookmark) }}
            <small>#{{ bookmark.id }}</small>
          </a>
        </h3>
        <div class="metadata">
          <small>{{ bookmark.url }}</small>
        </div>
        <div>
          <ClientOnly>
            <span>{{ formatDate(bookmark.date_added) }}</span>
          </ClientOnly>
        </div>
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
  .title small {
    color: lightgray;
  }
  .metadata {
    margin: 0 0 0.6rem;
  }
}
</style>
