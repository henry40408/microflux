<script setup lang="ts">
import type { LinkdingBookmark } from "~/schema/linkding";

const model = defineModel<LinkdingBookmark>({ required: true });
const emit = defineEmits<{ delete: [id: number] }>();

const bookmarkTitle = computed(
  () => model.value.title || model.value.website_title,
);
const bookmarkDescription = computed(
  () => model.value.description || model.value.website_description,
);
const summary = useSummarize(model.value.url);
const source = computed(
  () => `${bookmarkTitle.value}

${summary.data.value?.finalUrl || ""}

${pangu(summary.data.value?.summary || "")}`,
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
          bookmarkTitle
        }}</NuxtLink>
        <small>#{{ modelValue.id }}</small>
      </h3>
      <small>{{ modelValue.url }}</small>
    </div>
    <div v-if="bookmarkDescription">
      <blockquote m-0>{{ bookmarkDescription }}</blockquote>
    </div>
    <div space-x-1 text-right md:text-left>
      <small>created</small>
      <DateTime :datetime="modelValue.date_added" />
    </div>
    <div v-if="summary.done.value">
      <pre m-0 mb-2><code text-wrap>{{ source }}</code></pre>
      <MyButton block text-right md:text-left :done="copied" @click="copy"
        >copy to clipboard</MyButton
      >
    </div>
    <div class="my-controls">
      <small>actions</small>
      <MyButton
        :clear="summary.clear"
        :done="summary.done.value"
        :error="summary.error"
        :pending="summary.pending.value"
        @click="summary.execute"
        >🔍 summarize<template #clear>reset summary</template></MyButton
      >
      <DeleteBookmarkButton v-model="model" @delete="onDelete" />
    </div>
  </div>
</template>
