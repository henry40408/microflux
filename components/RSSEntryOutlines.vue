<template>
  <details>
    <summary>dates, feeds &amp; categories</summary>
    <p>
      <span class="outline-items">
        <span class="outline-item">categories</span>
        <span
          v-for="group in categories"
          :key="group.category.id"
          class="outline-item"
        >
          <BaseButton @click="$emit('selectCategory', group.category.id)">{{
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
          <BaseButton @click="$emit('selectFeed', group.feed.id)">{{
            group.feed.title
          }}</BaseButton>
          <sup>{{ group.count }}</sup>
        </span>
        <i v-if="!feeds.length" class="outline-item">no feeds</i>
      </span>
    </p>
    <p>
      <span class="outline-items">
        <span class="outline-item">
          date<sup>{{ timezone }}</sup>
        </span>
        <span v-for="group in dates" :key="group.date" class="outline-item">
          <BaseButton @click="$emit('selectDate', group.date)">{{
            group.date
          }}</BaseButton>
          <sup>{{ group.count }}</sup>
        </span>
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
const emit = defineEmits<{
  selectCategory: [id: number];
  selectDate: [date?: string];
  selectFeed: [id: number];
}>();

const props = defineProps<{ date?: string }>();
const date = ref(props.date);
watch(
  () => props.date,
  () => (date.value = props.date),
);
watch(
  () => date.value,
  () => emit("selectDate", date.value),
);

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const dates = computed(() =>
  lodash(model.value)
    .groupBy((e) => formatISO(e.published_at, { representation: "date" }))
    .map((entries) => ({
      date: formatISO(entries[0].published_at, { representation: "date" }),
      count: entries.length,
    }))
    .orderBy([(g) => g.count, (g) => g.date], ["desc", "asc"])
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
