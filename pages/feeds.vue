<template>
  <div>
    <header>
      <NavBar />
      <h1>feeds &amp; categories</h1>
    </header>
    <main>
      <fieldset>
        <legend>actions</legend>
        <ul>
          <li>
            <BaseButton :status="fetched.status.value" @click="fetched.refresh"
              >reload</BaseButton
            >
          </li>
        </ul>
      </fieldset>
      <p>
        <strong>{{ feeds.length }}</strong> feed(s)
      </p>
      <div v-for="(feed, index) in feeds" :key="feed.id">
        <RSSFeed
          :feed="feeds[index]"
          :read="reads[feed.id] || 0"
          :unread="unreads[feed.id] || 0"
          @deleted="fetched.execute"
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
  feeds: await $client.miniflux.getFeeds.query(),
}));
const counters = computed(() => fetched.data.value?.counters);
const reads = computed(() => counters.value?.reads || {});
const unreads = computed(() => counters.value?.unreads || {});
const feeds = computed(() =>
  lodash.orderBy(fetched.data.value?.feeds || [], "title"),
);
</script>

<style scoped></style>
