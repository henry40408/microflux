<template>
  <div>
    <h3 class="bookmark-title">
      <NuxtLink :to="modelValue.url" target="_blank">{{
        pangu(resolvedTitle)
      }}</NuxtLink>
    </h3>
    <div>
      <small>{{ modelValue.url }}</small>
    </div>
    <blockquote v-if="resolvedDescription">
      {{ resolvedDescription }}
    </blockquote>
    <p>added: <BaseDateTime :datetime="modelValue.date_added" /></p>
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
  </div>
</template>

<script setup lang="ts">
import type { LinkdingBookmark } from "~/schema/linkding";

const model = defineModel<LinkdingBookmark>({ required: true });
const emit = defineEmits<{ deleted: [id: number] }>();

const resolvedTitle = computed(
  () => model.value.website_title || model.value.title,
);
const resolvedDescription = computed(
  () => model.value.website_description || model.value.description,
);

const { summary: summarized, fullUrl } = useSummarize(model.value.url);
const hasSummary = computed(() => summarized.status.value === "success");
const summary = computed(
  () => summarized.data.value?.output_data.markdown || "",
);
const copyableSummary = computed(
  () => `${pangu(resolvedTitle.value.replace("|", "-"))}

${fullUrl.data.value?.url}

${pangu(summary.value)}`,
);
const { copy, copied } = useClipboard({ source: copyableSummary });

const { $client } = useNuxtApp();
const deleted = useAsyncData(
  `delete-${model.value.id}`,
  () => $client.linkding.deleteBookmark.mutate(model.value.id),
  { immediate: false, server: false },
);

async function destroy() {
  await deleted.execute();
  emit("deleted", model.value.id);
}
</script>

<style scoped>
.bookmark-title {
  margin-bottom: 0;
}

.summary {
  text-wrap: wrap;
}

.summary-title {
  color: yellow;
}
</style>
