<template>
  <ClientOnly>
    <span class="icon">
      <span v-if="iconStatus === 'pending'"><BaseSpinner /></span>
      <span v-if="iconStatus !== 'pending' && iconSrc">
        <img :src="iconSrc" />
      </span>
    </span>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { MinifluxCompactEntry } from "~/server/trpc/routers/miniflux";

const model = defineModel<MinifluxCompactEntry>({ required: true });

const icon = useFeedIcon(model.value.feed.id, model.value.feed.icon?.icon_id);
const iconStatus = computed(() => icon.status.value);
const iconData = computed(() => icon.data.value?.data);
const iconSrc = computed(() =>
  iconData.value ? `data:${iconData.value}` : null,
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
