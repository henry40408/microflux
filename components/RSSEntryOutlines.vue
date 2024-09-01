<template>
  <details>
    <summary>outlines</summary>
    <div>
      categories
      <span v-for="group in categories" :key="group.category.id">
        <BaseButton @click="selectCategory(group.category.id)">{{
          group.category.title
        }}</BaseButton>
        ({{ group.count }})
      </span>
    </div>
    <div>
      feeds
      <span v-for="group in feeds" :key="group.feed.id">
        <BaseButton @click="selectFeed(group.feed.id)">{{
          group.feed.title
        }}</BaseButton>
        ({{ group.count }})
      </span>
    </div>
  </details>
</template>

<script setup lang="ts">
import lodash from "lodash";
import type {
  MinifluxCompactCategory,
  MinifluxCompactEntry,
} from "~/server/trpc/routers/miniflux";

const model = defineModel<MinifluxCompactEntry[]>({ required: true });

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
  const categoryId = parseQuery().get("categoryId");
  await navigateTo({ query: { categoryId, feedId } });
}
async function selectCategory(categoryId: number) {
  const feedId = parseQuery().get("feedId");
  await navigateTo({ query: { categoryId, feedId } });
}
</script>

<style scoped></style>
