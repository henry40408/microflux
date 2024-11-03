<template>
  <details>
    <summary>limit, dates, feeds &amp; categories</summary>
    <p>
      <span class="items">
        <span class="item">limit</span>
        <span class="item">
          <BaseButton @click="$emit('selectLimit', undefined)">100</BaseButton>
        </span>
        <span v-for="n in [500, 1000]" :key="n" class="item">
          <BaseButton
            :disabled="limit === String(n)"
            @click="$emit('selectLimit', n)"
            >{{ n }}</BaseButton
          >
        </span>
      </span>
    </p>
    <p>
      <span class="items">
        <span class="item">categories</span>
        <span v-for="group in categories" :key="group.category.id" class="item">
          <BaseButton @click="$emit('selectCategory', group.category.id)">{{
            group.category.title
          }}</BaseButton>
          <sup>{{ group.count }}</sup>
        </span>
        <i v-if="!categories.length" class="item">no categories</i>
      </span>
    </p>
    <p>
      <span class="items">
        <span class="item">feeds</span>
        <span v-for="group in feeds" :key="group.feed.id" class="item">
          <BaseButton @click="$emit('selectFeed', group.feed.id)">{{
            group.feed.title
          }}</BaseButton>
          <sup>{{ group.count }}</sup>
        </span>
        <i v-if="!feeds.length" class="item">no feeds</i>
      </span>
    </p>
    <p>
      <span class="items">
        <span class="item">
          date<sup>{{ timezone }}</sup>
        </span>
        <span v-for="group in dates" :key="group.date" class="item">
          <BaseButton @click="$emit('selectDate', group.date)">{{
            group.date
          }}</BaseButton>
          <sup>{{ group.count }}</sup>
        </span>
        <i v-if="!dates.length" class="item">no dates</i>
      </span>
    </p>
  </details>
</template>

<script setup lang="ts">
import { formatISO } from "date-fns";
import lodash from "lodash";
import type {
  MinifluxCompactCategory,
  MinifluxCompactEntry,
} from "~/server/trpc/routers/miniflux";

const model = defineModel<MinifluxCompactEntry[]>({ required: true });
defineEmits<{
  selectCategory: [id: number];
  selectDate: [date?: string];
  selectFeed: [id: number];
  selectLimit: [n: undefined | number];
}>();

defineProps<{ date?: string; limit?: string }>();

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const dates = computed(() =>
  lodash(model.value)
    .groupBy((e) => formatISO(e.published_at, { representation: "date" }))
    .map((entries) => ({
      date: formatISO(entries[0].published_at, { representation: "date" }),
      count: entries.length,
    }))
    .orderBy([(g) => g.date])
    .value(),
);
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
</script>

<style scoped>
.items {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  margin-left: -0.5rem;
}

.items .item {
  margin-left: 0.5rem;
  text-wrap: nowrap;
}
</style>
