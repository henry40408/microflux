<template>
  <span ref="titleRef" />
  <RSSEntryTitle v-model="model" @click="markAsRead" />
  <p>
    feed:
    <BaseButton @click="selectFeed">{{ modelValue.feed.title }}</BaseButton
    >, category:
    <BaseButton @click="selectCategory">{{
      modelValue.feed.category?.title
    }}</BaseButton
    >, published at: <BaseDateTime :datetime="modelValue.published_at" />
  </p>
  <p>
    <RSSEntryToggleStatus v-model="model" />,
    <BaseButton
      :clear="summarized.clear"
      :error="summarized.error"
      :status="summarized.status.value"
      @click="summarized.execute"
      >summarize<template #clear>clear summary</template></BaseButton
    >,
    <RSSEntrySave v-model="model" />
    <NuxtLink
      v-if="modelValue.comments_url"
      :to="modelValue.comments_url"
      target="_blank"
      >, comments
    </NuxtLink>
  </p>
  <RSSEntryContent
    v-if="!hasSummary"
    v-model="model"
    @toggle-status="toggleStatus"
  />
  <details v-if="hasSummary" ref="summaryRef">
    <summary class="summary-title">summary</summary>
    <pre class="summary"><code>{{ copyableSummary }}</code></pre>
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

const titleRef = ref<null | HTMLElement>(null);
const summaryRef = ref<null | HTMLElement>(null);

const model = defineModel<MinifluxCompactEntry>({ required: true });

const summarized = useSummarize(model.value.url);
const hasSummary = computed(() => summarized.status.value === "success");
const summary = computed(() => summarized.data.value?.summary || "");
const copyableSummary = computed(
  () => `${pangu(model.value.title)}

${summarized.data.value?.finalUrl}

${pangu(summary.value)}`,
);
const { copy, copied } = useClipboard({ source: copyableSummary });

async function selectFeed() {
  const categoryId = parseQuery().get("categoryId") || undefined;
  const feedId = model.value.feed.id;
  await navigateTo({ query: { categoryId, feedId } });
}
async function selectCategory() {
  const categoryId = model.value.feed.category?.id;
  if (!categoryId) return;
  const feedId = parseQuery().get("feedId") || undefined;
  await navigateTo({ query: { categoryId, feedId } });
}

const { $client } = useNuxtApp();
const fetched = useAsyncData(
  `entry-${model.value.id}-status`,
  () =>
    $client.miniflux.updateEntries.mutate({
      status: "read",
      entryIds: [model.value.id],
    }),
  { immediate: false, server: false },
);
function markAsRead() {
  fetched.execute().then(() => {
    model.value.status = "read";
  });
}

function toggleStatus(newStatus: string) {
  if (newStatus !== "read") return;
  titleRef.value?.scrollIntoView();
}
</script>

<style scoped>
.summary {
  text-wrap: wrap;
}

.summary-title {
  color: yellow;
}
</style>
