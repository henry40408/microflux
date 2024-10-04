<template>
  <span ref="titleRef" />
  <RSSEntryTitle v-model="model" @click="markAsRead" />
  <p>
    #{{ modelValue.id }}, feed:
    <BaseButton @click="selectFeed">{{ modelValue.feed.title }}</BaseButton
    >, category:
    <BaseButton @click="selectCategory">{{
      modelValue.feed.category.title
    }}</BaseButton
    >, published at {{ stale ? "🕸" : "🌱" }}
    <BaseDateTime :datetime="modelValue.published_at" />
  </p>
  <p>
    <RSSEntryToggleStatus v-model="model" />,
    <BaseButton
      :clear="summarized.clear"
      :error="summarized.error"
      :status="summarized.status.value"
      @click="summarized.execute"
      >summarize<template #clear>clear summary</template></BaseButton
    >, <RSSEntrySave v-model="model" />
    <span v-if="modelValue.comments_url"
      >,
      <NuxtLink :to="modelValue.comments_url" target="_blank">
        comments
      </NuxtLink> </span
    >,
    <NuxtLink :to="{ name: 'feeds', query: { feedId: modelValue.feed.id } }">
      edit feed
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
    <div>
      <BaseButton @click="collapse">collapse</BaseButton>,
      <BaseButton
        once
        :clear="() => void 0"
        :status="copied ? 'success' : 'idle'"
        @click="copy"
        >copy to clipboard</BaseButton
      >
    </div>
  </details>
</template>

<script setup lang="ts">
import { parseISO } from "date-fns";
import type { MinifluxCompactEntry } from "~/server/trpc/routers/miniflux";

const titleRef = ref<null | HTMLElement>(null);
const summaryRef = ref<null | HTMLElement>(null);

const model = defineModel<MinifluxCompactEntry>({ required: true });
watch(
  () => model.value.status,
  (next) => {
    if (next === "read") summaryRef.value?.removeAttribute("open");
  },
);

const route = useRoute();

const STALE_DELTA = 24 * 60 * 60 * 1000; // 1day
const now = computed(() => Date.now());
const stale = computed(
  () => now.value - parseISO(model.value.published_at).valueOf() > STALE_DELTA,
);
const summarized = useSummarize(model.value.url);
const hasSummary = computed(() => summarized.status.value === "success");
const summary = computed(
  () => summarized.data.value?.[0].output_data.markdown || "",
);
const copyableSummary = computed(
  () => `${pangu(model.value.title)}

${summarized.data.value?.[1].url}

${pangu(summary.value)}`,
);
const { copy, copied } = useClipboard({ source: copyableSummary });

async function selectFeed() {
  const categoryId = route.query.categoryId;
  const feedId = model.value.feed.id;
  await navigateTo({ query: { categoryId, feedId } });
}
async function selectCategory() {
  const categoryId = model.value.feed.category.id;
  if (!categoryId) return;
  const feedId = route.query.feedId;
  await navigateTo({ query: { categoryId, feedId } });
}

const { $client } = useNuxtApp();
const fetched = useAsyncData(
  `entry:${model.value.id}:status`,
  () =>
    $client.miniflux.updateEntries.mutate({
      status: "read",
      entryIds: [model.value.id],
    }),
  { immediate: false, server: false },
);

function collapse() {
  summaryRef.value?.removeAttribute("open");
}

async function markAsRead() {
  await fetched.execute();
  model.value.status = "read";
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
  filter: sepia(100%);
}
</style>
