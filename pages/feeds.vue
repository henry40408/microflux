<template>
  <div>
    <header>
      <NavBar />
      <h1>feeds &amp; categories</h1>
    </header>
    <main>
      <h2>actions</h2>
      <ul>
        <li>
          <BaseButton :status="fetched.status.value" @click="fetched.refresh"
            >reload</BaseButton
          >
        </li>
      </ul>
      <div v-for="feed in feeds" :key="feed.id">
        <EditRSSFeed
          :categories="categories"
          :feed="feed"
          :read="reads[feed.id] || 0"
          :unread="unreads[feed.id] || 0"
          @deleted="fetched.refresh"
          @updated="fetched.refresh"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import lodash from "lodash";

useHead({ title: "feeds" });

const { $client } = useNuxtApp();
const fetched = useAsyncData("feeds-categories", async () => ({
  counters: await $client.miniflux.getCounters.query(),
  categories: await $client.miniflux.getCategories.query(),
  feeds: await $client.miniflux.getFeeds.query(),
}));
const reads = computed(() => fetched.data.value?.counters.reads || {});
const unreads = computed(() => fetched.data.value?.counters.unreads || {});
const categories = computed(() => fetched.data.value?.categories || []);
const feeds = computed(() =>
  lodash.orderBy(fetched.data.value?.feeds || [], "title"),
);
</script>

<style scoped></style>
