<template>
  <details>
    <summary>feeds &amp; categories</summary>
    <p>
      <span class="outline-items">
        <span class="outline-item">categories</span>
        <span
          v-for="group in categories"
          :key="group.category.id"
          class="outline-item"
        >
          <BaseButton @click="selectCategory(group.category.id)">{{
            group.category.title
          }}</BaseButton>
          <sup>{{ group.count }}</sup>
        </span>
        <i v-if="!categories.length" class="outline-item">no categories</i>
      </span>
    </p>
    <p>
      <span class="outline-items">
        <span class="outline-item">feeds</span>
        <span v-for="group in feeds" :key="group.feed.id" class="outline-item">
          <BaseButton @click="selectFeed(group.feed.id)">{{
            group.feed.title
          }}</BaseButton>
          <sup>{{ group.count }}</sup>
        </span>
        <i v-if="!feeds.length" class="outline-item">no feeds</i>
      </span>
    </p>
  </details>
</template>

<script setup lang="ts">
import lodash from "lodash";
import type {
  MinifluxCompactCategory,
  MinifluxCompactEntry,
} from "~/server/trpc/routers/miniflux";

const model = defineModel<MinifluxCompactEntry[]>({ required: true });

const route = useRoute();

const feeds = computed(() =>
  lodash(model.value)
    .groupBy("feed.id")
    .map((entries) => ({ feed: entries[0].feed, count: entries.length }))
    .orderBy([(g) => g.count, (g) => g.feed.title], ["desc", "asc"])
    .value(),
);
const categories = computed(() =>
  lodash(model.value)
    .groupBy("feed.category.id")
    .map((entries) => ({
      category: entries[0].feed.category,
      count: entries.length,
    }))
    .filter((g) => !!g.category)
    .map((g) => ({ ...g, category: g.category as MinifluxCompactCategory }))
    .orderBy([(g) => g.count, (g) => g.category.title], ["desc", "asc"])
    .value(),
);

async function selectFeed(feedId: number) {
  const categoryId = route.query.categoryId;
  await navigateTo({ query: { categoryId, feedId } });
}
async function selectCategory(categoryId: number) {
  const feedId = route.query.feedId;
  await navigateTo({ query: { categoryId, feedId } });
}
</script>

<style scoped>
.outline-item {
  margin-left: 0.5rem;
  text-wrap: nowrap;
}

.outline-items {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  margin-left: -0.5rem;
}
</style>
