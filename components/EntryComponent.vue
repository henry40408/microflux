<script setup lang="ts">
import { useToggle } from "@vueuse/core";
import { differenceInDays, intlFormat } from "date-fns";
import pangu from "pangu";

import type { CompactMinifluxEntry } from "@/types";
import type { IntlFormatFormatOptions } from "date-fns/intlFormat";

const model = defineModel<CompactMinifluxEntry>({ required: true });
const entryRef = defineModel<Element>("entryRef");

const emit = defineEmits<{
  categoryClick: [id: number];
  entryCollapsed: [id: number];
  feedClick: [id: number];
}>();

const [showPublished, togglePublished] = useToggle(false);
const translucentPublished = computed(() =>
  differenceInDays(new Date(model.value.published_at), new Date()),
);

const options: IntlFormatFormatOptions = {
  dateStyle: "medium",
  timeStyle: "medium",
};
function formatPublishedAt(time: string) {
  return intlFormat(new Date(time), options);
}
</script>

<template>
  <div>
    <h2 ref="entryRef">
      <a
        :class="{ 'text-gray-400': model.status === 'read' }"
        :href="model.url"
        target="_blank"
        rel="nofollow noopener"
      >
        {{ pangu.spacing(model.title) }}
        <small text-gray-400> #{{ model.id }}</small>
      </a>
    </h2>
    <div
      pb-2
      space-y-2
      text-right
      md:flex
      md:flex-wrap
      md:space-y-0
      md:text-nowrap
    >
      <div md:mr-2>
        <small pr-2>feed</small>
        <a href="#" @click.prevent="emit('feedClick', model.feed.id)">
          {{ model.feed.title }}
        </a>
      </div>
      <div md:mr-2>
        <small pr-2>category</small>
        <a
          href="#"
          @click.prevent="emit('categoryClick', model.feed.category.id)"
        >
          {{ model.feed.category.title }}
        </a>
      </div>
      <div md:mr-1>
        <small pr-1>published</small>
        <span v-if="showPublished" @click="togglePublished()">
          <time :datetime="model.published_at" :title="model.published_at">
            {{ formatPublishedAt(model.published_at) }}
          </time>
        </span>
        <span
          v-else
          :class="{ 'opacity-50': translucentPublished }"
          @click="togglePublished()"
        >
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-html="freshnessEmoji(model.published_at)" />
          <time :datetime="model.published_at" :title="model.published_at">
            {{ formatRelativeTime(model.published_at) }}
          </time>
        </span>
      </div>
    </div>
    <EntryAction v-model="model" />
    <EntryContent v-model="model" @collapsed="emit('entryCollapsed', model.id)">
      <EntryAction v-model="model" in-content pb-2 />
    </EntryContent>
  </div>
</template>
