<template>
  <h1>Microflux</h1>
  <div class="actions">
    <small>actions </small>
    <span v-if="pending">loading...</span>
    <span v-else>
      <a href="#" @click.prevent="onRefreshList">refresh</a>
    </span>
  </div>
  <div v-if="data?.entries.length > 0">
    <div v-for="entry in data.entries" :key="entry.id" class="entry">
      <h2>
        <a :href="entry.url" target="_blank" rel="nofollow">
          {{ entry.title }}
          <small> #{{ entry.id }}</small>
        </a>
      </h2>
      <div class="metadata">
        <small>feed</small> {{ entry.feed.title }} <small>category</small>
        {{ entry.feed.category.title }}
      </div>
      <EntryAction
        :id="entry.id"
        :url="entry.url"
        @mark-as-read="onEntryMarkedAsRead"
      />
      <h3>content</h3>
      <blockquote>{{ entry.content }}</blockquote>
      <EntryAction
        :id="entry.id"
        :url="entry.url"
        @mark-as-read="onEntryMarkedAsRead"
      />
    </div>
  </div>
  <div v-else>
    <em>(no entries)</em>
  </div>
</template>

<script setup lang="ts">
const { data, pending, refresh } = await useFetch("/api/entries");

function onRefreshList() {
  refresh();
}

function onEntryMarkedAsRead(id) {
  data.value = {
    ...data.value,
    entries: data.value.entries.filter((e) => e.id !== id),
  };
  refresh();
}
</script>

<style scoped>
small {
  color: lightgray;
}

.entry {
  margin: 0 0 1rem;
  .metadata {
    margin: 0 0 1rem;
  }
}

.actions {
  margin: 0 0 1rem;
}
</style>
