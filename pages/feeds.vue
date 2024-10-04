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
          <li>sort</li>
          <ul>
            <li>
              <BaseButton
                :disabled="sort === Sort.NAME"
                @click="toggleSort(Sort.NAME)"
                >name (alphabetical)</BaseButton
              >
            </li>
            <li>
              <BaseButton
                :disabled="sort === Sort.UNREAD"
                @click="toggleSort(Sort.UNREAD)"
                >unreads (more to less)</BaseButton
              >
            </li>
          </ul>
        </ul>
      </fieldset>
      <RSSNewFeed :categories="categories" @added="fetched.execute" />
      <p>
        <strong>{{ feeds.length }}</strong> feeds
      </p>
      <div v-for="(feed, index) in feeds" :key="feed.id">
        <span
          :ref="
            (el) => {
              if (el) feedRefs[feed.id] = el as Element;
            }
          "
        />
        <RSSFeed
          v-model="feeds[index]"
          :categories="categories"
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

enum Sort {
  NAME = "name",
  UNREAD = "unread",
}

const [sort, toggleSort] = useToggle(Sort.NAME);
const feedRefs = ref<Record<number, Element>>({});

const { $client } = useNuxtApp();
const fetched = useAsyncData("feeds-categories", async () => ({
  counters: await $client.miniflux.getCounters.query(),
  categires: await $client.miniflux.getCategories.query(),
  feeds: await $client.miniflux.getFeeds.query(),
}));
const counters = computed(() => fetched.data.value?.counters);
const reads = computed(() => counters.value?.reads || {});
const unreads = computed(() => counters.value?.unreads || {});
const categories = computed(() => fetched.data.value?.categires || []);
const feeds = computed(() =>
  lodash.sortBy(fetched.data.value?.feeds || [], [
    (f) => {
      switch (sort.value) {
        case Sort.NAME:
          return f.title;
        case Sort.UNREAD:
          return unreads.value[f.id] * -1 || 0;
      }
    },
  ]),
);

(async () => {
  await until(fetched.status).toBe("success");
  const feedId = parseQuery().get("feedId");
  if (feedId) feedRefs.value[Number(feedId)]?.scrollIntoView();
})();
</script>

<style scoped></style>
