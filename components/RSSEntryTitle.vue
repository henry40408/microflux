<template>
  <h3>
    <NuxtLink
      :class="{
        'text-gray-300': isRead,
        'link:text-gray-300': isRead,
        'visited:text-gray-300': isRead,
        'dark:text-gray-700': isRead,
        'dark:link:text-gray-700': isRead,
        'dark:visited:text-gray-700': isRead,
      }"
      :to="modelValue.url"
      target="_blank"
      @click="$emit('click')"
      >{{ pangu(modelValue.title) }}</NuxtLink
    >
  </h3>
</template>

<script setup lang="ts">
import type { MinifluxCompactEntry } from "~/server/trpc/routers/miniflux";

const model = defineModel<MinifluxCompactEntry>({ required: true });

defineEmits<{ click: [] }>();

const isRead = computed(() => model.value.status === "read");
</script>

<style scoped></style>
