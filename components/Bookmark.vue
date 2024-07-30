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
  <div class="space-y-2 mb-4">
    <div>
      <h3 class="m-0">
        <a :href="modelValue.url" rel="noreferrer noopener" target="_blank">{{
          bookmarkTitle
        }}</a>
        <small class="ml-1">#{{ modelValue.id }}</small>
      </h3>
      <small>{{ modelValue.url }}</small>
    </div>
    <div v-if="bookmarkDescription">
      <blockquote class="m-0">{{ bookmarkDescription }}</blockquote>
    </div>
    <div class="flex space-x-2 items-center">
      <small class="block">created</small>
      <time class="block" :datetime="modelValue.date_added">{{
        ago(modelValue.date_added)
      }}</time>
    </div>
    <div class="space-y-1" v-if="summary">
      <div class="bg-slate-500 text-white p-2">
        <pre class="m-0 text-wrap">{{ source }}</pre>
      </div>
      <MyButton class="block" :done="copied" @click="copy"
        >copy to clipboard</MyButton
      >
    </div>
    <div class="flex space-x-2">
      <SummarizeButton class="block" v-model="summary" :url="modelValue.url" />
      <DeleteBookmarkButton class="block" v-model="model" @delete="onDelete" />
    </div>
  </div>
</template>
