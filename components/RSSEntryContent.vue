<template>
  <details ref="contentRef" @toggle="fetched.execute">
    <summary>content</summary>
    <div v-if="pending"><BaseSpinner /></div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-html="content" />
    <div>
      <BaseButton @click="collapse">collapse</BaseButton>
      {{ " " }}
      <RSSEntryToggleStatus v-model="model" />
      {{ " " }}
      <RSSEntrySave v-model="model" />
    </div>
  </details>
</template>

<script setup lang="ts">
import type { MinifluxCompactEntry } from "~/server/trpc/routers/miniflux";

const contentRef = ref<null | HTMLElement>();

const model = defineModel<MinifluxCompactEntry>({ required: true });
watch(
  () => model.value.status,
  (next) => {
    if (next === "read") contentRef.value?.removeAttribute("open");
  },
);

const { $client } = useNuxtApp();
const fetched = useAsyncData(
  `entry-${model.value.id}-content`,
  () => $client.miniflux.getContent.query(model.value.id),
  { server: false, immediate: false },
);
const content = computed(() => fetched.data.value?.content || "");
const pending = computed(() => fetched.status.value === "pending");

function collapse() {
  contentRef.value?.removeAttribute("open");
}
</script>

<style scoped></style>
