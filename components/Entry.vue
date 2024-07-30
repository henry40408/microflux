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
  <div>
    <div ref="entryTitle">
      <EntryTitle v-model="model" />
    </div>
    <div>
      <a href="#" @click.prevent="setFeedId(modelValue.feed.id)">{{
        modelValue.feed.title
      }}</a>
      <div>/</div>
      <a href="#" @click.prevent="setCategoryId(modelValue.feed.category.id)">{{
        modelValue.feed.category.title
      }}</a>
      <div>/</div>
      <time :datetime="modelValue.published_at">{{
        ago(modelValue.published_at)
      }}</time>
    </div>
    <div>
      <ToggleStatusButton v-model="model" />
      <SummarizeButton v-if="!isRead" v-model="summary" :url="model.url" />
      <SaveButton v-if="!isRead" v-model="model" />
    </div>
    <div v-if="!isRead && summary">
      <div>
        <code>
          <pre>{{ pangu(source) }}</pre>
        </code>
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
