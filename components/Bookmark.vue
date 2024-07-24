<script setup lang="ts">
import { useClipboard } from "@vueuse/core";

import type { LinkdingBookmark } from "~/types";

const model = defineModel<LinkdingBookmark>({ required: true });
const emit = defineEmits<{ delete: [id: number] }>();

const summary = ref("");
const source = computed(
  () => `${model.value.title || model.value.website_title}

${model.value.url}

${summary.value}`,
);
const { copy, copied } = useClipboard({ source });

function onDelete(id: number) {
  emit("delete", id);
}
</script>

<template>
  <div class="space-y-2">
    <div>
      <a
        class="text-lg"
        :href="modelValue.url"
        rel="noreferrer noopener"
        target="_blank"
        >{{ modelValue.title || modelValue.website_title }}</a
      >
      <span class="ml-2 text-sm">#{{ modelValue.id }}</span>
      <div class="text-sm">{{ modelValue.url }}</div>
    </div>
    <div class="border-l-solid border-l-slate-500">
      <blockquote>
        {{ modelValue.description || modelValue.website_description }}
      </blockquote>
    </div>
    <div>
      <time :datetime="modelValue.date_added">{{
        ago(modelValue.date_added)
      }}</time>
    </div>
    <div v-if="summary" class="space-y-2">
      <div class="bg-slate-300 dark:bg-slate-600 p-2">
        <code>
          <pre class="m-0 text-wrap">{{ source }}</pre>
        </code>
      </div>
      <div>
        <MyButton :done="copied" @click="copy">copy to clipboard</MyButton>
      </div>
    </div>
    <div>
      <SummarizeButton v-model="summary" :url="modelValue.url" />
      <DeleteBookmarkButton v-model="model" @delete="onDelete" />
    </div>
  </div>
</template>
