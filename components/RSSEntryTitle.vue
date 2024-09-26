<template>
  <h3>
    <span v-if="iconStatus === 'pending'"><BaseSpinner /></span>
    <span v-if="iconStatus !== 'pending' && iconSrc" class="icon">
      <img :src="iconSrc" />
    </span>
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

.read {
  filter: grayscale(100%) opacity(50%);
}
</style>
