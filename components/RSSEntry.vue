<template>
  <RSSEntryTitle v-model="model" />
  <div>
    feed:
    <BaseButton @click="clickFeed">{{ modelValue.feed.title }}</BaseButton
    >, category:
    <BaseButton @click="clickCategory">{{
      modelValue.feed.category?.title
    }}</BaseButton>
  </div>
  <div>
    <RSSEntryToggleStatus v-model="model" />
    {{ " " }}
    <BaseButton
      :clear="summarized.clear"
      :error="summarized.error"
      :status="summarized.status.value"
      @click="summarized.execute"
      >summarize<template #clear>clear summary</template></BaseButton
    >
    {{ " " }}
    <RSSEntrySave v-model="model" />
  </div>
  <RSSEntryContent v-if="!hasSummary" v-model="model" />
  <details v-if="hasSummary" ref="summaryRef">
    <summary text-yellow-600 dark:text-yellow-300>summary</summary>
    <pre text-wrap>{{ copyableSummary }}</pre>
    <BaseButton
      once
      :clear="() => {}"
      :status="copied ? 'success' : 'idle'"
      @click="copy"
      >copy to clipboard</BaseButton
    >
  </details>
</template>

<script setup lang="ts">
import type { MinifluxCompactEntry } from "~/server/trpc/routers/miniflux";

const summaryRef = ref<null | HTMLElement>(null);

const model = defineModel<MinifluxCompactEntry>({ required: true });
watch(
  () => model.value.status,
  (next) => {
    if (next === "read") summarized.clear();
  },
);

const summarized = useSummarize(model.value.url);
const hasSummary = computed(() => summarized.status.value === "success");
const summary = computed(() => summarized.data.value?.summary || "");
const copyableSummary = computed(
  () => `${pangu(model.value.title)}

${summarized.data.value?.finalUrl}

${pangu(summary.value)}`,
);
const { copy, copied } = useClipboard({ source: copyableSummary });

async function clickFeed() {
  const categoryId = parseQuery().get("categoryId");
  const feedId = model.value.feed.id;
  await navigateTo({ query: { categoryId, feedId } });
}
async function clickCategory() {
  const categoryId = model.value.feed.category?.id;
  if (!categoryId) return;
  const feedId = parseQuery().get("feedId");
  await navigateTo({ query: { categoryId, feedId } });
}
</script>

<style scoped></style>
