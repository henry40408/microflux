<template>
  <div>
    <h3>
      <NuxtLink :to="modelValue.url" target="_blank">{{
        pangu(resolvedTitle)
      }}</NuxtLink>
    </h3>
    <blockquote>{{ resolvedDescription }}</blockquote>
    <div>added: <BaseDateTime :datetime="modelValue.date_added" /></div>
    <div>
      <BaseButton
        :clear="summarized.clear"
        :error="summarized.error"
        :status="summarized.status.value"
        @click="summarized.execute"
        >summarize<template #clear>clear summary</template></BaseButton
      >
      {{ " " }}
      <BaseConfirm
        once
        :error="deleted.error"
        :status="deleted.status.value"
        @confirm="destroy"
        >delete</BaseConfirm
      >
    </div>
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

const summarized = useSummarize(model.value.url);
const hasSummary = computed(() => summarized.status.value === "success");
const summary = computed(() => summarized.data.value?.summary || "");
const copyableSummary = computed(
  () => `${pangu(resolvedTitle.value)}

${summarized.data.value?.finalUrl}

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

<style scoped></style>
