<template>
  <select>
    <option
      v-for="category in categories"
      :key="category.id"
      :selected="selected.id === category.id"
    >
      {{ category.title }}
    </option>
  </select>
</template>

<script setup lang="ts">
import type { MinifluxCompactCategory } from "~/server/trpc/routers/miniflux";

defineProps<{
  categories: MinifluxCompactCategory[];
  selected: MinifluxCompactCategory;
}>();
</script>

<style scoped></style>
