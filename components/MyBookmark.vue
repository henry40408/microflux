<script setup lang="ts">
import { useClipboard } from "@vueuse/core";

import type { LinkdingBookmark } from "~/types";

const model = defineModel<LinkdingBookmark>({ required: true });
const emit = defineEmits<{ delete: [id: number] }>();

const bookmarkTitle = computed(
  () => model.value.title || model.value.website_title,
);
const bookmarkDescription = computed(
  () => model.value.description || model.value.website_description,
);
const summary = ref("");
const source = computed(
  () => `${bookmarkTitle.value}

${model.value.url}

${summary.value}`,
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
        <a :href="modelValue.url" rel="noreferrer noopener" target="_blank">{{
          bookmarkTitle
        }}</a>
        <small>#{{ modelValue.id }}</small>
      </h3>
      <small>{{ modelValue.url }}</small>
    </div>
    <div v-if="bookmarkDescription">
      <blockquote m-0>{{ bookmarkDescription }}</blockquote>
    </div>
    <div space-x-1 text-right md:text-left>
      <small>created</small>
      <time :datetime="modelValue.date_added">{{
        ago(modelValue.date_added)
      }}</time>
    </div>
    <div v-if="summary" space-y-2>
      <pre m-0><code text-wrap>{{ source }}</code></pre>
      <MyButton block text-right md:text-left :done="copied" @click="copy"
        >copy to clipboard</MyButton
      >
    </div>
    <div class="my-controls">
      <SummarizeButton v-model="summary" :url="modelValue.url" />
      <DeleteBookmarkButton v-model="model" @delete="onDelete" />
    </div>
  </div>
</template>
