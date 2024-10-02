<template>
  <div class="inline">
    <select
      v-model="selectedCategoryId"
      :disabled="updated.status.value === 'pending'"
      @change="updateFeed"
    >
      <option :value="selectedCategory.id">
        {{ selectedCategory.title }}
      </option>
      <option v-for="category in other" :key="category.id" :value="category.id">
        {{ category.title }}
      </option>
    </select>
    <div>
      <small v-if="done">updated!</small>
      <small v-if="updated.error">{{ updated.error }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MinifluxCompactCategory } from "~/server/trpc/routers/miniflux";

const props = defineProps<{
  feedId: number;
  categories: MinifluxCompactCategory[];
  selectedCategory: MinifluxCompactCategory;
}>();

const selectedCategoryId = ref(props.selectedCategory.id);
const other = computed(() =>
  props.categories.filter((c) => c.id !== props.selectedCategory.id),
);

const done = ref(false);
const timeout = useTimeoutFn(() => {
  done.value = false;
}, 3000);

const { $client } = useNuxtApp();
const updated = useAsyncData(
  `update-category:${props.feedId}`,
  () =>
    $client.miniflux.updateFeed.mutate({
      id: props.feedId,
      categoryId: selectedCategoryId.value,
    }),
  { immediate: false, server: false },
);

async function updateFeed() {
  await updated.execute();
  done.value = true;
  timeout.start();
}
</script>

<style scoped>
.inline {
  align-items: baseline;
  display: flex;
}
</style>
