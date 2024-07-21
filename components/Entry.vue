<script setup lang="ts">
import { secondsToMilliseconds } from "date-fns";
import { useClipboard } from "@vueuse/core";

import type { MinifluxCompactEntry } from "../server/api/entries.get";

const model = defineModel<MinifluxCompactEntry>({ required: true });
const isRead = computed(() => model.value.status === "read");

const route = useRoute();

const summary = ref("");
const source = computed(
  () => `${model.value.title}

${model.value.url}

${summary.value}`,
);
const { copy, copied } = useClipboard({ source });

const { data, error, status, execute } = await useLazyFetch(
  `/api/entries/${model.value.id}`,
  {
    immediate: false,
    server: false,
    timeout: secondsToMilliseconds(30),
  },
);

async function onDetailsToggle() {
  if (data.value) return;
  await execute();
}

async function setCategoryId(categoryId: number) {
  const { feedId } = route.query;
  await navigateTo({ query: { categoryId, feedId } });
}

async function setFeedId(feedId: number) {
  const { categoryId } = route.query;
  await navigateTo({ query: { categoryId, feedId } });
}
</script>

<template>
  <div class="space-y-2" :class="{ 'text-slate-200': isRead }">
    <div>
      <a
        :class="{ 'text-slate-200': isRead }"
        :href="modelValue.url"
        target="_blank"
        >{{ modelValue.title }}</a
      >
      #{{ modelValue.id }}
    </div>
    <div>
      <a href="#" @click.prevent="setFeedId(modelValue.feed.id)">{{
        modelValue.feed.title
      }}</a>
      /
      <a href="#" @click.prevent="setCategoryId(modelValue.feed.category.id)">{{
        modelValue.feed.category.title
      }}</a>
    </div>
    <div>
      <ToggleStatusButton v-model="model" />
      <SummarizeButton v-model="summary" :url="model.url" />
      <SaveButton v-model="model" />
    </div>
    <div v-if="summary" class="space-y-2">
      <div class="bg-slate-300 p-2">
        <code>
          <pre class="text-wrap m-0">{{ source }}</pre>
        </code>
      </div>
      <div>
        <MyButton :done="copied" @click="copy">
          copy to clipboard<template #done>copied!</template>
        </MyButton>
      </div>
    </div>
    <div class="border-dotted p-2">
      <details @toggle="onDetailsToggle">
        <summary>content</summary>
        <div class="mt-2">
          <span v-if="status === 'pending'">...</span>
          <span v-if="status === 'error'">{{ error }}</span>
          <span v-if="data" v-html="data.content"></span>
        </div>
      </details>
    </div>
  </div>
</template>
