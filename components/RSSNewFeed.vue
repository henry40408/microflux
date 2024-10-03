<template>
  <form @submit.prevent="submit">
    <fieldset>
      <legend>new feed</legend>
      <label :for="urlId">URL</label>
      <input :id="urlId" v-model="url" type="text" placeholder="feed URL..." />
      <label :for="categoryIdId">category</label>
      <select :id="categoryIdId" v-model="categoryId">
        <option :value="-1" disabled>select a category</option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.title }}
        </option>
      </select>
      <input type="submit" :value="addLabel" :disabled="!shouldAdd" />
      <div v-if="added.error">{{ added.error }}</div>
    </fieldset>
  </form>
</template>

<script setup lang="ts">
import type { MinifluxCompactCategory } from "~/server/trpc/routers/miniflux";

defineProps<{ categories: MinifluxCompactCategory[] }>();

const emit = defineEmits<{
  added: [];
}>();

const url = ref("");
const urlId = useId();
const categoryId = ref(-1);
const categoryIdId = useId();

const { $client } = useNuxtApp();
const added = useAsyncData(
  "add-feed",
  () =>
    $client.miniflux.createFeed.mutate({
      url: url.value,
      categoryId: categoryId.value,
    }),
  { immediate: false, server: false },
);
const addLabel = computed(() =>
  added.status.value === "pending" ? "..." : "add",
);
const shouldAdd = computed(
  () =>
    !!url.value && categoryId.value !== -1 && added.status.value !== "pending",
);

async function submit() {
  added.clear();
  await added.execute();
  await nextTick();
  if (added.status.value === "success") {
    url.value = "";
    categoryId.value = -1;
    emit("added");
  }
}
</script>

<style scoped></style>
