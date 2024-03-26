<template>
  <h1>Microflux</h1>
  <div>
    <h2>options</h2>
    <label>
      <input v-model="autoMarkAsRead" type="checkbox" />
      Mark as read automatically
    </label>
  </div>
  <h2>{{ unread }} <small>unread entries</small></h2>
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
        <a
          :href="entry.url"
          target="_blank"
          rel="nofollow"
          @click="onTitleClicked(entry.id)"
        >
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
        :title="entry.title"
        @mark-as-read="onEntryMarkedAsRead"
        @open="onTitleClicked"
      />
      <details>
        <summary>content</summary>
        <div v-html="entry.content"></div>
        <EntryAction
          :id="entry.id"
          :url="entry.url"
          :title="entry.title"
          @mark-as-read="onEntryMarkedAsRead"
          @open="onTitleClicked"
        />
      </details>
    </div>
  </div>
  <div v-else>
    <em>(no entries)</em>
  </div>
</template>

<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";

const { data, pending, refresh } = await useFetch("/api/entries");
const autoMarkAsRead = useLocalStorage("auto-mark-as-read", false);

const unread = computed(() => {
  if (!data.value) return 0;
  const { counters } = data.value;
  return Object.values(counters.unreads).reduce((acc, v) => acc + v, 0);
});

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

async function onTitleClicked(id) {
  if (!autoMarkAsRead.value) return;
  try {
    await $fetch("/api/entry", {
      method: "POST",
      body: { op: "mark-as-read", id },
    });
    onEntryMarkedAsRead(id);
  } catch (err) {
    console.error("failed to mark as read", err);
  }
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
