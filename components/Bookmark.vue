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
  <div>
    <div>
      <a :href="modelValue.url" rel="noreferrer noopener" target="_blank">{{
        modelValue.title || modelValue.website_title
      }}</a>
      <span>#{{ modelValue.id }}</span>
      <div>{{ modelValue.url }}</div>
    </div>
    <div>
      <blockquote>
        {{ modelValue.description || modelValue.website_description }}
      </blockquote>
    </div>
    <div>
      <time :datetime="modelValue.date_added">{{
        ago(modelValue.date_added)
      }}</time>
    </div>
    <div v-if="summary">
      <div>
        <code>
          <pre>{{ source }}</pre>
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
