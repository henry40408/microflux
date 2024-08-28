<script setup lang="ts">
import type { MinifluxCompactEntry } from "~/server/trpc/routers/miniflux";

const model = defineModel<MinifluxCompactEntry>({ required: true });

defineEmits<{ clickCategory: [id: number]; clickFeed: [id: number] }>();

const entryTitleRef = ref<HTMLElement | null>(null);

const fetchedSummary = useSummarize(model.value.url);
const source = computed(
  () =>
    `${model.value.title}

${fetchedSummary.data.value?.finalUrl || ""}

${pangu(fetchedSummary.data.value?.summary || "")}`,
);
const { copy, copied } = useClipboard({ source });

function onScrollToEntry() {
  entryTitleRef.value?.scrollIntoView();
}
</script>

<template>
  <div space-y-2>
    <div ref="entryTitleRef">
      <AppEntryTitle v-model="model" />
    </div>
    <div space-y-2>
      <div
        space-y-2
        text-right
        md:flex
        md:items-center
        md:space-x-2
        md:space-y-0
      >
        <div space-x-1>
          <span>📡</span>
          <a href="#" @click.prevent="$emit('clickFeed', modelValue.feed.id)">{{
            modelValue.feed.title
          }}</a>
        </div>
        <div v-if="modelValue.feed.category" space-x-1>
          <span>📁</span>
          <a
            href="#"
            @click.prevent="$emit('clickCategory', modelValue.feed.category.id)"
            >{{ modelValue.feed.category.title }}</a
          >
        </div>
        <div space-x-1>
          <span>⏰</span>
          <DateTime :datetime="modelValue.published_at" />
        </div>
      </div>
      <div class="my-controls">
        <AppEntryToggleStatusButton v-model="model" />
        <BaseButton
          :clear="fetchedSummary.clear"
          :done="fetchedSummary.done.value"
          :error="fetchedSummary.error"
          :pending="fetchedSummary.pending.value"
          @click="fetchedSummary.execute"
          >🔎 summarize<template #clear>🔄 reset summary</template></BaseButton
        >
        <AppEntrySaveButton v-model="model" />
        <NuxtLink
          v-if="model.comments_url"
          block
          :to="model.comments_url"
          target="_blank"
          >💬 comments</NuxtLink
        >
      </div>
    </div>
    <div v-if="fetchedSummary.done.value" space-y-2>
      <pre m-0><code text-wrap>{{ source }}</code></pre>
      <BaseButton block text-right md:text-left :done="copied" @click="copy">
        📋 copy to clipboard<template #clear>copied!</template>
      </BaseButton>
    </div>
    <div>
      <AppEntryContent v-model="model" @scroll-to-entry="onScrollToEntry" />
    </div>
  </div>
</template>
