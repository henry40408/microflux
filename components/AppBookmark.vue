<template>
  <div>
    <h3>
      <NuxtLink :to="modelValue.url" target="_blank">{{
        pangu(resolvedTitle)
      }}</NuxtLink>
    </h3>
    <div>
      <pre>{{ modelValue.url }}</pre>
    </div>
    <p>
      added at <BaseDateTime :datetime="modelValue.date_added" />, tags:
      <BaseButton
        v-for="tag in modelValue.tag_names"
        :key="tag"
        @click="$emit('filterByTag', tag)"
        >{{ tag }}</BaseButton
      >
      <em v-if="modelValue.tag_names.length <= 0">no tags</em>
    </p>
    <p>
      <BaseButton
        :clear="summarized.clear"
        :error="summarized.error"
        :status="summarized.status.value"
        @click="summarized.execute"
        >summarize<template #clear>clear summary</template></BaseButton
      >,
      <BaseConfirm
        once
        :error="deleted.error"
        :status="deleted.status.value"
        @confirm="destroy"
        >delete</BaseConfirm
      >
    </p>
    <details v-if="!hasSummary">
      <summary>description</summary>
      <em v-if="!resolvedDescription">not available</em>
      {{ resolvedDescription }}
    </details>
    <details v-if="hasSummary" ref="summaryRef">
      <summary class="summary-title">summary</summary>
      <pre class="summary"><code>{{ copyableSummary }}</code></pre>
      <BaseButton
        once
        :clear="() => void 0"
        :status="copied ? 'success' : 'idle'"
        @click="copy"
        >copy to clipboard</BaseButton
      >
    </details>
  </div>
</template>

<script setup lang="ts">
import type { LinkdingBookmark } from "~/schema/linkding";

const model = defineModel<LinkdingBookmark>({ required: true });
const emit = defineEmits<{
  deleted: [id: number];
  filterByTag: [tag: string];
}>();

const resolvedTitle = computed(
  () => model.value.website_title || model.value.title,
);
const resolvedDescription = computed(
  () => model.value.website_description || model.value.description,
);

const summarized = useSummarize(model.value.url);
const hasSummary = computed(() => summarized.status.value === "success");
const summary = computed(
  () => summarized.data.value?.[0].output_data.markdown || "",
);
const copyableSummary = computed(
  () => `${pangu(resolvedTitle.value.replace("|", "-"))}

${summarized.data.value?.[1].url}

${pangu(summary.value)}`,
);
const { copy, copied } = useClipboard({ source: copyableSummary });

const { $client } = useNuxtApp();
const deleted = useAsyncData(
  `delete:${model.value.id}`,
  () => $client.linkding.deleteBookmark.mutate(model.value.id),
  { immediate: false, server: false },
);

async function destroy() {
  await deleted.execute();
  emit("deleted", model.value.id);
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
