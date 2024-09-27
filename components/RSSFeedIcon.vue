<template>
  <ClientOnly>
    <span v-if="iconSrc" class="icon">
      <img :src="iconSrc" />
    </span>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { MinifluxCompactEntry } from "~/server/trpc/routers/miniflux";

const model = defineModel<MinifluxCompactEntry>({ required: true });

const iconId = computed(() => model.value.feed.icon?.icon_id);
const iconSrc = computed(() =>
  iconId.value ? `/api/miniflux/icon/${iconId.value}` : null,
);
</script>

<style scoped>
.icon {
  margin-right: 0.5rem;
}

.icon img {
  background: white;
  height: 1rem;
  vertical-align: middle;
  width: 1rem;
}
</style>
