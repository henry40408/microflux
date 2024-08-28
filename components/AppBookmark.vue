<script setup lang="ts">
import type { LinkdingBookmark } from "~/schema/linkding";

const model = defineModel<LinkdingBookmark>({ required: true });
const emit = defineEmits<{ delete: [id: number] }>();

const coalescedTitle = computed(
  () => model.value.title || model.value.website_title,
);
const coalescedDescription = computed(
  () => model.value.description || model.value.website_description,
);
const fetchedSummary = useSummarize(model.value.url);
const source = computed(
  () => `${coalescedTitle.value}

${fetchedSummary.data.value?.finalUrl || ""}

${pangu(fetchedSummary.data.value?.summary || "")}`,
);
const { copy, copied } = useClipboard({ source });

function onDelete(id: number) {
  emit("delete", id);
}
</script>

<template>
  <div space-y-2>
    <div>
      <h3 space-x-2 mb-0>
        <NuxtLink target="_blank" :to="modelValue.url">{{
          coalescedTitle
        }}</NuxtLink>
        <small>#{{ modelValue.id }}</small>
      </h3>
      <small>{{ modelValue.url }}</small>
    </div>
    <div v-if="coalescedDescription">
      <blockquote m-0>{{ coalescedDescription }}</blockquote>
    </div>
    <div space-x-1 text-right md:text-left>
      <span>⏰</span>
      <DateTime :datetime="modelValue.date_added" />
    </div>
    <div v-if="fetchedSummary.done.value">
      <pre m-0 mb-2><code text-wrap>{{ source }}</code></pre>
      <BaseButton block text-right md:text-left :done="copied" @click="copy"
        >📋 copy to clipboard</BaseButton
      >
    </div>
    <div class="my-controls">
      <BaseButton
        :clear="fetchedSummary.clear"
        :done="fetchedSummary.done.value"
        :error="fetchedSummary.error"
        :pending="fetchedSummary.pending.value"
        @click="fetchedSummary.execute"
        >🔍 summarize<template #clear>reset summary</template></BaseButton
      >
      <AppBookmarkDeleteButton v-model="model" @delete="onDelete" />
    </div>
  </div>
</template>
