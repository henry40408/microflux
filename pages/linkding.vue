<script setup lang="ts">
import { sample } from "lodash";
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

function onRandomBookmarksDelete(id: number) {
  randomPicked.value = null;
  onBookmarksDelete([id]);
}

function onRandomClick() {
  if (!data.value) return;
  randomPicked.value = sample(data.value.bookmarks);
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
      <div>
        <small>actions</small>
        {{}}
        <span v-if="pending">loading...</span>
        <span v-else>
          <a href="#" @click.prevent="refresh">refresh</a>
        </span>
        |
        <a href="#" @click.prevent="onRandomClick">random</a>
      </div>
      <h3 v-if="randomPicked">random picked</h3>
      <div v-if="randomPicked" class="random-picked">
        <h3 class="title">
          <a :href="randomPicked.url" target="_blank" rel="nofollow noopener">
            {{ getLinkdingTitle(randomPicked) }}
            <small>#{{ randomPicked.id }}</small>
          </a>
        </h3>
        <div class="metadata">
          <small>{{ randomPicked.url }}</small>
        </div>
        <blockquote class="description">
          {{ getLinkdingDescription(randomPicked) }}
        </blockquote>
        <div class="metadata">
          <ClientOnly>
            <small>added</small>
            {{}}
            <span>{{ formatDate(randomPicked.date_added) }}</span>
          </ClientOnly>
        </div>
        <BookmarkAction
          :key="randomPicked.id"
          :bookmark="randomPicked"
          @deleted="onRandomBookmarksDelete(randomPicked.id)"
        />
      </div>
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
        <BookmarkAction
          :key="bookmark.id"
          :bookmark="bookmark"
          @deleted="onBookmarksDelete"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.error {
  background-color: pink;
  color: black;
}

.random-picked {
  border: 1px solid lightgray;
  @media (prefers-color-scheme: dark) {
    border: 1px solid white;
  }
  padding: 0.6rem;
  margin: 0.6rem 0;
  .title {
    margin: 0;
  }
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
