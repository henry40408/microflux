<template>
  <details>
    <summary>freshness, feeds &amp; categories</summary>
    <p>
      <span class="outline-items">
        <span class="outline-item">freshness</span>
        <span class="outline-item"
          ><input
            :id="noneId"
            v-model="freshness"
            type="radio"
            :value="undefined"
          /><label :for="noneId">none</label></span
        >
        <span class="outline-item"
          ><input
            :id="todayId"
            v-model="freshness"
            type="radio"
            value="today"
          /><label :for="todayId">today</label></span
        >
        <span class="outline-item"
          ><input
            :id="yesterdayId"
            v-model="freshness"
            type="radio"
            value="yesterday"
          /><label :for="yesterdayId">yesterday</label></span
        >
      </span>
    </p>
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
  </details>
</template>

<script setup lang="ts">
import lodash from "lodash";
import type {
  MinifluxCompactCategory,
  MinifluxCompactEntry,
} from "~/server/trpc/routers/miniflux";

const noneId = useId();
const todayId = useId();
const yesterdayId = useId();

const model = defineModel<MinifluxCompactEntry[]>({ required: true });
const emit = defineEmits<{
  selectCategory: [id: number];
  selectFeed: [id: number];
  selectFreshness: [type?: string];
}>();

const props = defineProps<{ freshness?: string }>();
const freshness = ref(props.freshness);
watch(
  () => props.freshness,
  () => (freshness.value = props.freshness),
);
watch(
  () => freshness.value,
  () => emit("selectFreshness", freshness.value),
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
