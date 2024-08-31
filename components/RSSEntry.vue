<template>
  <RSSEntryTitle v-model="model" />
  <div>
    feed: {{ modelValue.feed.title }}, category:
    {{ modelValue.feed.category?.title }}
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
    <summary>summary</summary>
    <pre text-wrap>{{ copyableSummary }}</pre>
    <BaseButton once :status="copied ? 'success' : 'idle'" @click="copy"
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
</script>

<style scoped></style>
