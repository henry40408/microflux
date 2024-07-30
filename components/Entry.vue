<script setup lang="ts">
import { useClipboard } from "@vueuse/core";

import type { MinifluxCompactEntry } from "../server/api/entries.get";

const model = defineModel<MinifluxCompactEntry>({ required: true });
const isRead = computed(() => model.value.status === "read");

const route = useRoute();

const entryTitle = ref<HTMLElement | null>(null);
const summary = ref("");
const source = computed(
  () => `${model.value.title}

${model.value.url}

${summary.value}`,
);
const { copy, copied } = useClipboard({ source });

async function setCategoryId(categoryId: number) {
  const { feedId } = route.query;
  await navigateTo({ query: { categoryId, feedId } });
}

async function setFeedId(feedId: number) {
  const { categoryId } = route.query;
  await navigateTo({ query: { categoryId, feedId } });
}

function onToggleStatus(s: string) {
  if (s === "read") {
    entryTitle.value?.scrollIntoView();
  }
}
</script>

<template>
  <div class="space-y-1">
    <div ref="entryTitle">
      <EntryTitle v-model="model" />
    </div>
    <div class="flex space-x-2 items-center">
      <small class="block">feed</small>
      <a
        class="block"
        href="#"
        @click.prevent="setFeedId(modelValue.feed.id)"
        >{{ modelValue.feed.title }}</a
      >
      <small class="block">category</small>
      <a
        class="block"
        href="#"
        @click.prevent="setCategoryId(modelValue.feed.category.id)"
        >{{ modelValue.feed.category.title }}</a
      >
      <small class="block">published at</small>
      <time class="block" :datetime="modelValue.published_at">{{
        ago(modelValue.published_at)
      }}</time>
    </div>
    <div class="flex space-x-2 items-end mb-2">
      <small class="block">actions</small>
      <ToggleStatusButton class="block" v-model="model" />
      <SummarizeButton
        class="block"
        v-if="!isRead"
        v-model="summary"
        :url="model.url"
      />
      <SaveButton class="block" v-if="!isRead" v-model="model" />
    </div>
    <div class="space-y-2" v-if="!isRead && summary">
      <div class="bg-slate-500 text-white p-2">
        <pre class="m-0 text-wrap">{{ pangu(source) }}</pre>
      </div>
      <div>
        <MyButton :done="copied" @click="copy">
          copy to clipboard<template #done>copied!</template>
        </MyButton>
      </div>
    </div>
    <div>
      <EntryContent v-model="model" @toggle-status="onToggleStatus" />
    </div>
  </div>
</template>
