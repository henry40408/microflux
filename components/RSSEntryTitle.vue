<template>
  <h3>
    <NuxtLink
      :class="{ read: isRead }"
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

<style scoped>
.read {
  filter: grayscale(100%) opacity(50%);
}
</style>
