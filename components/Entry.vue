<script setup lang="ts">
import { secondsToMilliseconds } from "date-fns";
import { useClipboard } from "@vueuse/core";

import type { MinifluxCompactEntry } from "../server/api/entries.get";

const model = defineModel<MinifluxCompactEntry>({ required: true });
const isRead = computed(() => model.value.status === "read");

const route = useRoute();

const entryTitle = ref<HTMLElement | null>(null);
const entryContent = ref<HTMLDetailsElement | null>(null);
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

function onToggleStatus(s: string) {
  if (s === "read" && entryContent.value?.open) {
    entryContent.value?.removeAttribute("open");
    entryTitle.value?.scrollIntoView();
  }
}
</script>

<template>
  <div
    class="space-y-4"
    :class="{ 'text-slate-300': isRead, 'dark:text-slate-600': isRead }"
  >
    <div ref="entryTitle" class="space-y-2 md:flex md:items-end md:space-y-0">
      <a
        class="block text-xl"
        :class="{ 'text-slate-300': isRead, 'dark:text-slate-600': isRead }"
        :href="modelValue.url"
        target="_blank"
        >{{ pangu(modelValue.title) }}</a
      >
      <div class="text-sm md:ml-2">#{{ modelValue.id }}</div>
    </div>
    <div class="flex space-x-2 items-center">
      <a
        class="block"
        href="#"
        @click.prevent="setFeedId(modelValue.feed.id)"
        >{{ modelValue.feed.title }}</a
      >
      <div>/</div>
      <a
        class="block"
        href="#"
        @click.prevent="setCategoryId(modelValue.feed.category.id)"
        >{{ modelValue.feed.category.title }}</a
      >
    </div>
    <div class="text-right md:text-left">
      <ToggleStatusButton v-model="model" @toggle-status="onToggleStatus" />
      <SummarizeButton v-if="!isRead" v-model="summary" :url="model.url" />
      <SaveButton v-if="!isRead" v-model="model" />
    </div>
    <div v-if="!isRead && summary" class="space-y-2">
      <div class="bg-slate-200 dark:bg-slate-700 p-2">
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
      <details
        @toggle="onDetailsToggle"
        ref="entryContent"
        class="my-entry-content"
      >
        <summary>content</summary>
        <div class="mt-2 space-y-2">
          <div>
            <span v-if="status === 'pending'">...</span>
            <span v-if="status === 'error'">{{ error }}</span>
            <span v-if="data" v-html="data.content"></span>
          </div>
          <div>
            <ToggleStatusButton
              v-model="model"
              @toggle-status="onToggleStatus"
            />
          </div>
        </div>
      </details>
    </div>
  </div>
</template>

<style>
.my-entry-content img {
  @apply max-w-full;
}
</style>
