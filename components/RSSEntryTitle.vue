<template>
  <h3>
    <NuxtLink
      :class="{ 'no-underline': isRead }"
      :to="modelValue.url"
      target="_blank"
      @click="$emit('click')"
      ><span
        :class="{ 'text-gray-300': isRead, 'dark:text-gray-700': isRead }"
        >{{ modelValue.title }}</span
      ></NuxtLink
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
